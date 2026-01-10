import { mysqlTable, varchar, int, timestamp, text, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const users = mysqlTable("users", {
    id: int("id").primaryKey().autoincrement(),
    username: varchar("username", { length: 100 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    profilePicture: text("profile_picture"),

    // Daily nutrition goals
    goalCalories: int("goal_calories").default(2000),
    goalProtein: decimal("goal_protein", { precision: 10, scale: 2 }).default("150"),
    goalCarbs: decimal("goal_carbs", { precision: 10, scale: 2 }).default("250"),
    goalFat: decimal("goal_fat", { precision: 10, scale: 2 }).default("65"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
});
