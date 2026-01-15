import { mysqlTable, varchar, int, decimal, timestamp, text, index } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

// GLP-1 Medication Information
export const glpMedicationInfo = mysqlTable("glp_medication_info", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),

    name: varchar("name", { length: 100 }).notNull(), // 
    currentDose: varchar("current_dose", { length: 50 }).notNull(),
    injectionDay: varchar("injection_day", { length: 100 }).notNull(),
    startDate: timestamp("start_date").notNull(),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
}));

// Dose History - tracks when doses were taken
export const glpDoseHistory = mysqlTable("glp_dose_history", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

    timestamp: timestamp("timestamp").notNull(),
    dose: varchar("dose", { length: 50 }).notNull(),
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

// Side Effects Tracking
export const glpSideEffects = mysqlTable("glp_side_effects", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

    name: varchar("name", { length: 100 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(), // 'none', 'mild', 'moderate', 'severe'
    notes: text("notes"),
    timestamp: timestamp("timestamp").notNull(),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
    severityIdx: index("severity_idx").on(table.severity),
}));

// Appetite & Hunger Logs
export const glpAppetiteLogs = mysqlTable("glp_appetite_logs", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

    timestamp: timestamp("timestamp").notNull(),
    hungerLevel: int("hunger_level").notNull(),
    cravingsIntensity: int("cravings_intensity").notNull(), // 0-10 scale
    notes: text("notes"),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

// Weight Tracking
export const glpWeightEntries = mysqlTable("glp_weight_entries", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

    timestamp: timestamp("timestamp").notNull(),
    weight: decimal("weight", { precision: 10, scale: 2 }).notNull(),
    unit: varchar("unit", { length: 10 }).notNull(),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    timestampIdx: index("timestamp_idx").on(table.timestamp),
}));

// Dose Progression - tracks the progression through different dose phases
export const glpDoseProgression = mysqlTable("glp_dose_progression", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),

    phase: int("phase").notNull(),
    dose: varchar("dose", { length: 50 }).notNull(), // e.g., "0.25mg", "0.5mg", "1mg"
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date"),
    status: varchar("status", { length: 20 }).notNull(),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
    phaseIdx: index("phase_idx").on(table.phase),
}));

// Notification Settings for GLP-1 Tracking
export const glpNotificationSettings = mysqlTable("glp_notification_settings", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),

    notificationsEnabled: int("notifications_enabled").notNull().default(0),

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
}));
