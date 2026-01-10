import { mysqlTable, varchar, int, decimal, timestamp, text, boolean, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

// User's saved/custom foods
export const foods = mysqlTable("foods", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }),

    // Food identification
    name: varchar("name", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 255 }),
    barcode: varchar("barcode", { length: 50 }),

    // FatSecret API reference (if synced from external API)
    fatSecretId: varchar("fatsecret_id", { length: 100 }),

    // Serving information
    servingSize: decimal("serving_size", { precision: 10, scale: 2 }),
    servingUnit: varchar("serving_unit", { length: 50 }), // e.g., "g", "ml", "cup", "piece"

    // Nutritional information (per serving)
    calories: decimal("calories", { precision: 10, scale: 2 }),
    protein: decimal("protein", { precision: 10, scale: 2 }), // grams
    carbohydrates: decimal("carbohydrates", { precision: 10, scale: 2 }), // grams
    fat: decimal("fat", { precision: 10, scale: 2 }), // grams
    fiber: decimal("fiber", { precision: 10, scale: 2 }), // grams
    sugar: decimal("sugar", { precision: 10, scale: 2 }), // grams
    sodium: decimal("sodium", { precision: 10, scale: 2 }), // mg

    // Additional metadata
    description: text("description"),
    category: varchar("category", { length: 100 }),
    isCustom: boolean("is_custom").default(false), // true if user-created
    isVerified: boolean("is_verified").default(false),

    // Timestamps
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    nameIdx: index("name_idx").on(table.name),
    barcodeIdx: index("barcode_idx").on(table.barcode),
}));

// User's food diary/log entries
export const foodLogs = mysqlTable("food_logs", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    foodId: int("food_id").references(() => foods.id, { onDelete: "set null" }),

    // Meal information
    mealType: varchar("meal_type", { length: 50 }).notNull(), // breakfast, lunch, dinner, snack
    logDate: timestamp("log_date").notNull(),

    // Quantity consumed
    servings: decimal("servings", { precision: 10, scale: 2 }).notNull().default("1"),

    // Snapshot of nutritional values at time of logging
    totalCalories: decimal("total_calories", { precision: 10, scale: 2 }),
    totalProtein: decimal("total_protein", { precision: 10, scale: 2 }),
    totalCarbs: decimal("total_carbs", { precision: 10, scale: 2 }),
    totalFat: decimal("total_fat", { precision: 10, scale: 2 }),

    // Optional notes
    notes: text("notes"),

    // Timestamps
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    logDateIdx: index("log_date_idx").on(table.logDate),
    mealTypeIdx: index("meal_type_idx").on(table.mealType),
}));

// User's favorite foods for quick access
export const favoriteFoods = mysqlTable("favorite_foods", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    foodId: int("food_id").references(() => foods.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    foodIdIdx: index("food_id_idx").on(table.foodId),
}));
