import express from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

const router = express.Router();

/**
 * GET /api/db/users/:id
 * Get user profile by ID
 */
router.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
                goalCalories: users.goalCalories,
                goalProtein: users.goalProtein,
                goalCarbs: users.goalCarbs,
                goalFat: users.goalFat,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json({
            success: true,
            user,
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            error: "Failed to fetch user",
            message: error.message,
        });
    }
});

/**
 * PUT /api/db/users/:id
 * Update user profile
 */
router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, profilePicture } = req.body;

        // Verify user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        // Prepare update data
        const updates = {};
        if (firstName !== undefined) updates.firstName = firstName;
        if (lastName !== undefined) updates.lastName = lastName;
        if (profilePicture !== undefined) updates.profilePicture = profilePicture;

        // Perform update
        await db
            .update(users)
            .set(updates)
            .where(eq(users.id, parseInt(id)));

        // Fetch updated user
        const [updatedUser] = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                profilePicture: users.profilePicture,
                goalCalories: users.goalCalories,
                goalProtein: users.goalProtein,
                goalCarbs: users.goalCarbs,
                goalFat: users.goalFat,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "User profile updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({
            error: "Failed to update user",
            message: error.message,
        });
    }
});


/**
 * GET /api/db/users/:id/goals
 * Get user's nutrition goals
 */
router.get("/users/:id/goals", async (req, res) => {
    try {
        const { id } = req.params;

        const [user] = await db
            .select({
                goalCalories: users.goalCalories,
                goalProtein: users.goalProtein,
                goalCarbs: users.goalCarbs,
                goalFat: users.goalFat,
            })
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        if (!user) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        res.json({
            success: true,
            goals: {
                calories: parseInt(user.goalCalories) || 2000,
                protein: parseFloat(user.goalProtein) || 150,
                carbs: parseFloat(user.goalCarbs) || 250,
                fat: parseFloat(user.goalFat) || 65,
            },
        });
    } catch (error) {
        console.error("Error fetching goals:", error);
        res.status(500).json({
            error: "Failed to fetch goals",
            message: error.message,
        });
    }
});

/**
 * PUT /api/db/users/:id/goals
 * Update user's nutrition goals
 */
router.put("/users/:id/goals", async (req, res) => {
    try {
        const { id } = req.params;
        const { calories, protein, carbs, fat } = req.body;

        // Verify user exists
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        if (!existingUser) {
            return res.status(404).json({
                error: "User not found",
            });
        }

        // Prepare update data
        const updates = {};
        if (calories !== undefined) updates.goalCalories = parseInt(calories);
        if (protein !== undefined) updates.goalProtein = parseFloat(protein);
        if (carbs !== undefined) updates.goalCarbs = parseFloat(carbs);
        if (fat !== undefined) updates.goalFat = parseFloat(fat);

        // Perform update
        await db
            .update(users)
            .set(updates)
            .where(eq(users.id, parseInt(id)));

        // Fetch updated goals
        const [updatedUser] = await db
            .select({
                goalCalories: users.goalCalories,
                goalProtein: users.goalProtein,
                goalCarbs: users.goalCarbs,
                goalFat: users.goalFat,
            })
            .from(users)
            .where(eq(users.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "Nutrition goals updated successfully",
            goals: {
                calories: parseInt(updatedUser.goalCalories) || 2000,
                protein: parseFloat(updatedUser.goalProtein) || 150,
                carbs: parseFloat(updatedUser.goalCarbs) || 250,
                fat: parseFloat(updatedUser.goalFat) || 65,
            },
        });
    } catch (error) {
        console.error("Error updating goals:", error);
        res.status(500).json({
            error: "Failed to update goals",
            message: error.message,
        });
    }
});

export default router;
