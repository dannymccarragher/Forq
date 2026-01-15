import express from "express";
import { db } from "../db/index.js";
import {
    glpMedicationInfo,
    glpDoseHistory,
    glpSideEffects,
    glpAppetiteLogs,
    glpWeightEntries,
    glpDoseProgression,
    glpNotificationSettings
} from "../db/schema/index.js";
import { eq, and, gte, lte, desc } from "drizzle-orm";

const router = express.Router();


/**
 * GET /api/db/glp/medication/:userId
 * Get medication info for a user
 */
router.get("/glp/medication/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const [medication] = await db
            .select()
            .from(glpMedicationInfo)
            .where(eq(glpMedicationInfo.userId, parseInt(userId)))
            .limit(1);

        res.json({
            success: true,
            medication: medication || null,
        });
    } catch (error) {
        console.error("Error fetching medication info:", error);
        res.status(500).json({
            error: "Failed to fetch medication info",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/medication
 * Create or update medication info
 */
router.post("/glp/medication", async (req, res) => {
    try {
        const { userId, name, currentDose, injectionDay, startDate } = req.body;

        // Check if medication info already exists
        const [existing] = await db
            .select()
            .from(glpMedicationInfo)
            .where(eq(glpMedicationInfo.userId, parseInt(userId)))
            .limit(1);

        if (existing) {
            // Update existing
            await db
                .update(glpMedicationInfo)
                .set({
                    name,
                    currentDose,
                    injectionDay,
                    startDate: new Date(startDate),
                })
                .where(eq(glpMedicationInfo.userId, parseInt(userId)));
        } else {
            // Insert new
            await db.insert(glpMedicationInfo).values({
                userId: parseInt(userId),
                name,
                currentDose,
                injectionDay,
                startDate: new Date(startDate),
            });
        }

        // Fetch updated medication info
        const [updated] = await db
            .select()
            .from(glpMedicationInfo)
            .where(eq(glpMedicationInfo.userId, parseInt(userId)))
            .limit(1);

        res.json({
            success: true,
            message: "Medication info saved successfully",
            medication: updated,
        });
    } catch (error) {
        console.error("Error saving medication info:", error);
        res.status(500).json({
            error: "Failed to save medication info",
            message: error.message,
        });
    }
});


/**
 * GET /api/db/glp/doses/:userId
 * Get dose history for a user
 */
router.get("/glp/doses/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 50 } = req.query;

        const doses = await db
            .select()
            .from(glpDoseHistory)
            .where(eq(glpDoseHistory.userId, parseInt(userId)))
            .orderBy(desc(glpDoseHistory.timestamp))
            .limit(parseInt(limit));

        res.json({
            success: true,
            doses,
        });
    } catch (error) {
        console.error("Error fetching dose history:", error);
        res.status(500).json({
            error: "Failed to fetch dose history",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/doses
 * Record a new dose
 */
router.post("/glp/doses", async (req, res) => {
    try {
        const { userId, timestamp, dose, notes } = req.body;

        const [result] = await db.insert(glpDoseHistory).values({
            userId: parseInt(userId),
            timestamp: new Date(timestamp),
            dose,
            notes,
        });

        // Fetch the inserted dose
        const [newDose] = await db
            .select()
            .from(glpDoseHistory)
            .where(eq(glpDoseHistory.id, result.insertId))
            .limit(1);

        res.json({
            success: true,
            message: "Dose recorded successfully",
            dose: newDose,
        });
    } catch (error) {
        console.error("Error recording dose:", error);
        res.status(500).json({
            error: "Failed to record dose",
            message: error.message,
        });
    }
});

// ==================== SIDE EFFECTS ====================

/**
 * GET /api/db/glp/side-effects/:userId
 * Get side effects for a user
 */
router.get("/glp/side-effects/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;

        let query = db
            .select()
            .from(glpSideEffects)
            .where(eq(glpSideEffects.userId, parseInt(userId)));

        // Apply date filters if provided
        if (startDate && endDate) {
            query = query.where(
                and(
                    gte(glpSideEffects.timestamp, new Date(startDate)),
                    lte(glpSideEffects.timestamp, new Date(endDate))
                )
            );
        }

        const sideEffects = await query
            .orderBy(desc(glpSideEffects.timestamp))
            .limit(parseInt(limit));

        res.json({
            success: true,
            sideEffects,
        });
    } catch (error) {
        console.error("Error fetching side effects:", error);
        res.status(500).json({
            error: "Failed to fetch side effects",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/side-effects
 * Record a new side effect
 */
router.post("/glp/side-effects", async (req, res) => {
    try {
        const { userId, name, severity, notes, timestamp } = req.body;

        const [result] = await db.insert(glpSideEffects).values({
            userId: parseInt(userId),
            name,
            severity,
            notes,
            timestamp: new Date(timestamp),
        });

        // Fetch the inserted side effect
        const [newSideEffect] = await db
            .select()
            .from(glpSideEffects)
            .where(eq(glpSideEffects.id, result.insertId))
            .limit(1);

        res.json({
            success: true,
            message: "Side effect recorded successfully",
            sideEffect: newSideEffect,
        });
    } catch (error) {
        console.error("Error recording side effect:", error);
        res.status(500).json({
            error: "Failed to record side effect",
            message: error.message,
        });
    }
});

/**
 * PUT /api/db/glp/side-effects/:id
 * Update a side effect
 */
router.put("/glp/side-effects/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { severity, notes } = req.body;

        await db
            .update(glpSideEffects)
            .set({ severity, notes })
            .where(eq(glpSideEffects.id, parseInt(id)));

        // Fetch updated side effect
        const [updated] = await db
            .select()
            .from(glpSideEffects)
            .where(eq(glpSideEffects.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "Side effect updated successfully",
            sideEffect: updated,
        });
    } catch (error) {
        console.error("Error updating side effect:", error);
        res.status(500).json({
            error: "Failed to update side effect",
            message: error.message,
        });
    }
});

// ==================== APPETITE LOGS ====================

/**
 * GET /api/db/glp/appetite/:userId
 * Get appetite logs for a user
 */
router.get("/glp/appetite/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;

        let query = db
            .select()
            .from(glpAppetiteLogs)
            .where(eq(glpAppetiteLogs.userId, parseInt(userId)));

        // Apply date filters if provided
        if (startDate && endDate) {
            query = query.where(
                and(
                    gte(glpAppetiteLogs.timestamp, new Date(startDate)),
                    lte(glpAppetiteLogs.timestamp, new Date(endDate))
                )
            );
        }

        const appetiteLogs = await query
            .orderBy(desc(glpAppetiteLogs.timestamp))
            .limit(parseInt(limit));

        res.json({
            success: true,
            appetiteLogs,
        });
    } catch (error) {
        console.error("Error fetching appetite logs:", error);
        res.status(500).json({
            error: "Failed to fetch appetite logs",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/appetite
 * Record a new appetite log
 */
router.post("/glp/appetite", async (req, res) => {
    try {
        const { userId, timestamp, hungerLevel, cravingsIntensity, notes } = req.body;

        const [result] = await db.insert(glpAppetiteLogs).values({
            userId: parseInt(userId),
            timestamp: new Date(timestamp),
            hungerLevel: parseInt(hungerLevel),
            cravingsIntensity: parseInt(cravingsIntensity),
            notes,
        });

        // Fetch the inserted appetite log
        const [newLog] = await db
            .select()
            .from(glpAppetiteLogs)
            .where(eq(glpAppetiteLogs.id, result.insertId))
            .limit(1);

        res.json({
            success: true,
            message: "Appetite log recorded successfully",
            appetiteLog: newLog,
        });
    } catch (error) {
        console.error("Error recording appetite log:", error);
        res.status(500).json({
            error: "Failed to record appetite log",
            message: error.message,
        });
    }
});

// ==================== WEIGHT ENTRIES ====================

/**
 * GET /api/db/glp/weight/:userId
 * Get weight entries for a user
 */
router.get("/glp/weight/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, limit = 100 } = req.query;

        let query = db
            .select()
            .from(glpWeightEntries)
            .where(eq(glpWeightEntries.userId, parseInt(userId)));

        // Apply date filters if provided
        if (startDate && endDate) {
            query = query.where(
                and(
                    gte(glpWeightEntries.timestamp, new Date(startDate)),
                    lte(glpWeightEntries.timestamp, new Date(endDate))
                )
            );
        }

        const weightEntries = await query
            .orderBy(desc(glpWeightEntries.timestamp))
            .limit(parseInt(limit));

        res.json({
            success: true,
            weightEntries,
        });
    } catch (error) {
        console.error("Error fetching weight entries:", error);
        res.status(500).json({
            error: "Failed to fetch weight entries",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/weight
 * Record a new weight entry
 */
router.post("/glp/weight", async (req, res) => {
    try {
        const { userId, timestamp, weight, unit } = req.body;

        const [result] = await db.insert(glpWeightEntries).values({
            userId: parseInt(userId),
            timestamp: new Date(timestamp),
            weight: parseFloat(weight),
            unit,
        });

        // Fetch the inserted weight entry
        const [newEntry] = await db
            .select()
            .from(glpWeightEntries)
            .where(eq(glpWeightEntries.id, result.insertId))
            .limit(1);

        res.json({
            success: true,
            message: "Weight recorded successfully",
            weightEntry: newEntry,
        });
    } catch (error) {
        console.error("Error recording weight:", error);
        res.status(500).json({
            error: "Failed to record weight",
            message: error.message,
        });
    }
});

// ==================== DOSE PROGRESSION ====================

/**
 * GET /api/db/glp/progression/:userId
 * Get dose progression for a user
 */
router.get("/glp/progression/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const progression = await db
            .select()
            .from(glpDoseProgression)
            .where(eq(glpDoseProgression.userId, parseInt(userId)))
            .orderBy(glpDoseProgression.phase);

        res.json({
            success: true,
            progression,
        });
    } catch (error) {
        console.error("Error fetching dose progression:", error);
        res.status(500).json({
            error: "Failed to fetch dose progression",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/progression
 * Add a new dose progression phase
 */
router.post("/glp/progression", async (req, res) => {
    try {
        const { userId, phase, dose, startDate, endDate, status } = req.body;

        const [result] = await db.insert(glpDoseProgression).values({
            userId: parseInt(userId),
            phase: parseInt(phase),
            dose,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            status,
        });

        // Fetch the inserted progression
        const [newProgression] = await db
            .select()
            .from(glpDoseProgression)
            .where(eq(glpDoseProgression.id, result.insertId))
            .limit(1);

        res.json({
            success: true,
            message: "Dose progression added successfully",
            progression: newProgression,
        });
    } catch (error) {
        console.error("Error adding dose progression:", error);
        res.status(500).json({
            error: "Failed to add dose progression",
            message: error.message,
        });
    }
});

/**
 * PUT /api/db/glp/progression/:id
 * Update a dose progression phase
 */
router.put("/glp/progression/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { dose, startDate, endDate, status } = req.body;

        const updates = {};
        if (dose !== undefined) updates.dose = dose;
        if (startDate !== undefined) updates.startDate = new Date(startDate);
        if (endDate !== undefined) updates.endDate = endDate ? new Date(endDate) : null;
        if (status !== undefined) updates.status = status;

        await db
            .update(glpDoseProgression)
            .set(updates)
            .where(eq(glpDoseProgression.id, parseInt(id)));

        // Fetch updated progression
        const [updated] = await db
            .select()
            .from(glpDoseProgression)
            .where(eq(glpDoseProgression.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "Dose progression updated successfully",
            progression: updated,
        });
    } catch (error) {
        console.error("Error updating dose progression:", error);
        res.status(500).json({
            error: "Failed to update dose progression",
            message: error.message,
        });
    }
});

// ==================== NOTIFICATION SETTINGS ====================

/**
 * GET /api/db/glp/notifications/:userId
 * Get notification settings for a user
 */
router.get("/glp/notifications/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const [settings] = await db
            .select()
            .from(glpNotificationSettings)
            .where(eq(glpNotificationSettings.userId, parseInt(userId)))
            .limit(1);

        res.json({
            success: true,
            notificationsEnabled: settings ? Boolean(settings.notificationsEnabled) : false,
        });
    } catch (error) {
        console.error("Error fetching notification settings:", error);
        res.status(500).json({
            error: "Failed to fetch notification settings",
            message: error.message,
        });
    }
});

/**
 * POST /api/db/glp/notifications
 * Update notification settings
 */
router.post("/glp/notifications", async (req, res) => {
    try {
        const { userId, notificationsEnabled } = req.body;

        // Check if settings already exist
        const [existing] = await db
            .select()
            .from(glpNotificationSettings)
            .where(eq(glpNotificationSettings.userId, parseInt(userId)))
            .limit(1);

        if (existing) {
            // Update existing
            await db
                .update(glpNotificationSettings)
                .set({ notificationsEnabled: notificationsEnabled ? 1 : 0 })
                .where(eq(glpNotificationSettings.userId, parseInt(userId)));
        } else {
            // Insert new
            await db.insert(glpNotificationSettings).values({
                userId: parseInt(userId),
                notificationsEnabled: notificationsEnabled ? 1 : 0,
            });
        }

        res.json({
            success: true,
            message: "Notification settings updated successfully",
            notificationsEnabled,
        });
    } catch (error) {
        console.error("Error updating notification settings:", error);
        res.status(500).json({
            error: "Failed to update notification settings",
            message: error.message,
        });
    }
});

// ==================== SUMMARY/DASHBOARD ====================

/**
 * GET /api/db/glp/summary/:userId
 * Get a summary of all GLP-1 data for a user
 */
router.get("/glp/summary/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        // Fetch all data in parallel
        const [medication, doses, sideEffects, appetiteLogs, weightEntries, progression, notifications] = await Promise.all([
            db.select().from(glpMedicationInfo).where(eq(glpMedicationInfo.userId, parseInt(userId))).limit(1),
            db.select().from(glpDoseHistory).where(eq(glpDoseHistory.userId, parseInt(userId))).orderBy(desc(glpDoseHistory.timestamp)).limit(10),
            db.select().from(glpSideEffects).where(eq(glpSideEffects.userId, parseInt(userId))).orderBy(desc(glpSideEffects.timestamp)).limit(20),
            db.select().from(glpAppetiteLogs).where(eq(glpAppetiteLogs.userId, parseInt(userId))).orderBy(desc(glpAppetiteLogs.timestamp)).limit(20),
            db.select().from(glpWeightEntries).where(eq(glpWeightEntries.userId, parseInt(userId))).orderBy(desc(glpWeightEntries.timestamp)).limit(20),
            db.select().from(glpDoseProgression).where(eq(glpDoseProgression.userId, parseInt(userId))).orderBy(glpDoseProgression.phase),
            db.select().from(glpNotificationSettings).where(eq(glpNotificationSettings.userId, parseInt(userId))).limit(1),
        ]);

        res.json({
            success: true,
            summary: {
                medication: medication[0] || null,
                recentDoses: doses,
                recentSideEffects: sideEffects,
                recentAppetiteLogs: appetiteLogs,
                recentWeightEntries: weightEntries,
                doseProgression: progression,
                notificationsEnabled: notifications[0] ? Boolean(notifications[0].notificationsEnabled) : false,
            },
        });
    } catch (error) {
        console.error("Error fetching GLP summary:", error);
        res.status(500).json({
            error: "Failed to fetch GLP summary",
            message: error.message,
        });
    }
});

export default router;
