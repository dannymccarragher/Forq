import express from "express";
import { db } from "../db/index.js";
import { foods, foodLogs, favoriteFoods } from "../db/schema/index.js";
import { eq, and, or, desc, asc, like, gte, lte, sql, between } from "drizzle-orm";

const router = express.Router();

// ==================== FOODS CRUD ====================

/**
 * GET /api/db/foods
 * Get all foods for a user (custom foods + saved foods)
 */
router.get("/foods", async (req, res) => {
    try {
        const { userId, search, category, isCustom, limit = 50, offset = 0 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Build WHERE conditions
        const conditions = [eq(foods.userId, parseInt(userId))];

        // Add search filter (search in name and brand)
        if (search) {
            conditions.push(
                or(
                    like(foods.name, `%${search}%`),
                    like(foods.brand, `%${search}%`)
                )
            );
        }

        // Add category filter
        if (category) {
            conditions.push(eq(foods.category, category));
        }

        // Add isCustom filter
        if (isCustom !== undefined) {
            conditions.push(eq(foods.isCustom, isCustom === 'true'));
        }

        // Execute query
        const results = await db
            .select()
            .from(foods)
            .where(and(...conditions))
            .limit(parseInt(limit))
            .offset(parseInt(offset))
            .orderBy(desc(foods.createdAt));

        res.json({
            success: true,
            count: results.length,
            foods: results
        });
    } catch (error) {
        console.error("Error fetching foods:", error);
        res.status(500).json({ error: "Failed to fetch foods", message: error.message });
    }
});

/**
 * GET /api/db/foods/:id
 * Get a specific food by ID
 */
router.get("/foods/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Fetch food by id and userId to ensure ownership
        const [food] = await db
            .select()
            .from(foods)
            .where(
                and(
                    eq(foods.id, parseInt(id)),
                    eq(foods.userId, parseInt(userId))
                )
            )
            .limit(1);

        if (!food) {
            return res.status(404).json({
                error: "Food not found or you don't have access to it"
            });
        }

        res.json({
            success: true,
            food
        });
    } catch (error) {
        console.error("Error fetching food:", error);
        res.status(500).json({ error: "Failed to fetch food", message: error.message });
    }
});

/**
 * POST /api/db/foods
 * Create a new custom food
 */
router.post("/foods", async (req, res) => {
    try {
        const {
            userId,
            name,
            brand,
            barcode,
            servingSize,
            servingUnit,
            calories,
            protein,
            carbohydrates,
            fat,
            fiber,
            sugar,
            sodium,
            description,
            category
        } = req.body;

        if (!userId || !name) {
            return res.status(400).json({ error: "userId and name are required" });
        }

        // Create new food entry
        const newFood = {
            userId: parseInt(userId),
            name,
            brand: brand || null,
            barcode: barcode || null,
            servingSize: servingSize ? parseFloat(servingSize) : null,
            servingUnit: servingUnit || null,
            calories: calories ? parseFloat(calories) : null,
            protein: protein ? parseFloat(protein) : null,
            carbohydrates: carbohydrates ? parseFloat(carbohydrates) : null,
            fat: fat ? parseFloat(fat) : null,
            fiber: fiber ? parseFloat(fiber) : null,
            sugar: sugar ? parseFloat(sugar) : null,
            sodium: sodium ? parseFloat(sodium) : null,
            description: description || null,
            category: category || null,
            isCustom: true, // User-created foods are always custom
            isVerified: false
        };

        const [result] = await db.insert(foods).values(newFood);

        // Fetch the created food
        const [createdFood] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, result.insertId))
            .limit(1);

        res.status(201).json({
            success: true,
            message: "Food created successfully",
            food: createdFood
        });
    } catch (error) {
        console.error("Error creating food:", error);
        res.status(500).json({ error: "Failed to create food", message: error.message });
    }
});

/**
 * PUT /api/db/foods/:id
 * Update an existing food
 */
router.put("/foods/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, ...updateData } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Verify food exists and belongs to user
        const [existingFood] = await db
            .select()
            .from(foods)
            .where(
                and(
                    eq(foods.id, parseInt(id)),
                    eq(foods.userId, parseInt(userId))
                )
            )
            .limit(1);

        if (!existingFood) {
            return res.status(404).json({
                error: "Food not found or you don't have access to it"
            });
        }

        // Only allow updating custom foods
        if (!existingFood.isCustom) {
            return res.status(403).json({
                error: "Cannot update non-custom foods"
            });
        }

        // Prepare update data
        const updates = {};
        const allowedFields = [
            'name', 'brand', 'barcode', 'servingSize', 'servingUnit',
            'calories', 'protein', 'carbohydrates', 'fat', 'fiber',
            'sugar', 'sodium', 'description', 'category'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                // Parse numeric fields
                if (['servingSize', 'calories', 'protein', 'carbohydrates', 'fat', 'fiber', 'sugar', 'sodium'].includes(field)) {
                    updates[field] = updateData[field] ? parseFloat(updateData[field]) : null;
                } else {
                    updates[field] = updateData[field];
                }
            }
        });

        // Perform update
        await db
            .update(foods)
            .set(updates)
            .where(eq(foods.id, parseInt(id)));

        // Fetch updated food
        const [updatedFood] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "Food updated successfully",
            food: updatedFood
        });
    } catch (error) {
        console.error("Error updating food:", error);
        res.status(500).json({ error: "Failed to update food", message: error.message });
    }
});

/**
 * DELETE /api/db/foods/:id
 * Delete a food
 */
router.delete("/foods/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Verify food exists and belongs to user
        const [existingFood] = await db
            .select()
            .from(foods)
            .where(
                and(
                    eq(foods.id, parseInt(id)),
                    eq(foods.userId, parseInt(userId))
                )
            )
            .limit(1);

        if (!existingFood) {
            return res.status(404).json({
                error: "Food not found or you don't have access to it"
            });
        }

        // Only allow deleting custom foods
        if (!existingFood.isCustom) {
            return res.status(403).json({
                error: "Cannot delete non-custom foods"
            });
        }

        // Delete the food (cascade will handle related records)
        await db
            .delete(foods)
            .where(eq(foods.id, parseInt(id)));

        res.json({
            success: true,
            message: "Food deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting food:", error);
        res.status(500).json({ error: "Failed to delete food", message: error.message });
    }
});

// ==================== FOOD LOGS CRUD ====================

/**
 * GET /api/db/food-logs
 * Get food logs for a user
 */
router.get("/food-logs", async (req, res) => {
    try {
        const { userId, startDate, endDate, mealType, limit = 100, offset = 0 } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Build WHERE conditions
        const conditions = [eq(foodLogs.userId, parseInt(userId))];

        // Add date range filter
        if (startDate && endDate) {
            conditions.push(
                between(foodLogs.logDate, new Date(startDate), new Date(endDate))
            );
        } else if (startDate) {
            conditions.push(gte(foodLogs.logDate, new Date(startDate)));
        } else if (endDate) {
            conditions.push(lte(foodLogs.logDate, new Date(endDate)));
        }

        // Add meal type filter
        if (mealType) {
            conditions.push(eq(foodLogs.mealType, mealType));
        }

        // Execute query with join to get food details
        const results = await db
            .select({
                log: foodLogs,
                food: foods
            })
            .from(foodLogs)
            .leftJoin(foods, eq(foodLogs.foodId, foods.id))
            .where(and(...conditions))
            .limit(parseInt(limit))
            .offset(parseInt(offset))
            .orderBy(desc(foodLogs.logDate), desc(foodLogs.createdAt));

        res.json({
            success: true,
            count: results.length,
            logs: results
        });
    } catch (error) {
        console.error("Error fetching food logs:", error);
        res.status(500).json({ error: "Failed to fetch food logs", message: error.message });
    }
});

/**
 * GET /api/db/food-logs/summary
 * Get nutritional summary for a date range
 */
router.get("/food-logs/summary", async (req, res) => {
    try {
        const { userId, date, startDate, endDate } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Build WHERE conditions
        const conditions = [eq(foodLogs.userId, parseInt(userId))];

        // Handle single date or date range
        if (date) {
            const targetDate = new Date(date);
            const nextDate = new Date(targetDate);
            nextDate.setDate(nextDate.getDate() + 1);
            conditions.push(
                between(foodLogs.logDate, targetDate, nextDate)
            );
        } else if (startDate && endDate) {
            conditions.push(
                between(foodLogs.logDate, new Date(startDate), new Date(endDate))
            );
        } else if (startDate) {
            conditions.push(gte(foodLogs.logDate, new Date(startDate)));
        } else if (endDate) {
            conditions.push(lte(foodLogs.logDate, new Date(endDate)));
        }

        // Get aggregate totals
        const [totals] = await db
            .select({
                totalCalories: sql`SUM(${foodLogs.totalCalories})`,
                totalProtein: sql`SUM(${foodLogs.totalProtein})`,
                totalCarbs: sql`SUM(${foodLogs.totalCarbs})`,
                totalFat: sql`SUM(${foodLogs.totalFat})`,
                totalFiber: sql`SUM(${foodLogs.totalFiber})`,
                totalWater: sql`SUM(${foodLogs.totalWater})`,
                entryCount: sql`COUNT(*)`
            })
            .from(foodLogs)
            .where(and(...conditions));

        // Get breakdown by meal type
        const mealBreakdown = await db
            .select({
                mealType: foodLogs.mealType,
                calories: sql`SUM(${foodLogs.totalCalories})`,
                protein: sql`SUM(${foodLogs.totalProtein})`,
                carbs: sql`SUM(${foodLogs.totalCarbs})`,
                fat: sql`SUM(${foodLogs.totalFat})`,
                fiber: sql`SUM(${foodLogs.totalFiber})`,
                water: sql`SUM(${foodLogs.totalWater})`,
                count: sql`COUNT(*)`
            })
            .from(foodLogs)
            .where(and(...conditions))
            .groupBy(foodLogs.mealType);

        res.json({
            success: true,
            summary: {
                totals: {
                    calories: parseFloat(totals.totalCalories) || 0,
                    protein: parseFloat(totals.totalProtein) || 0,
                    carbs: parseFloat(totals.totalCarbs) || 0,
                    fat: parseFloat(totals.totalFat) || 0,
                    fiber: parseFloat(totals.totalFiber) || 0,
                    water: parseFloat(totals.totalWater) || 0,
                    entries: parseInt(totals.entryCount) || 0
                },
                byMealType: mealBreakdown.map(meal => ({
                    mealType: meal.mealType,
                    calories: parseFloat(meal.calories) || 0,
                    protein: parseFloat(meal.protein) || 0,
                    carbs: parseFloat(meal.carbs) || 0,
                    fat: parseFloat(meal.fat) || 0,
                    fiber: parseFloat(meal.fiber) || 0,
                    water: parseFloat(meal.water) || 0,
                    entries: parseInt(meal.count) || 0
                }))
            }
        });
    } catch (error) {
        console.error("Error fetching summary:", error);
        res.status(500).json({ error: "Failed to fetch summary", message: error.message });
    }
});

/**
 * POST /api/db/food-logs
 * Log a food entry
 */
router.post("/food-logs", async (req, res) => {
    try {
        const {
            userId,
            foodId,
            mealType,
            logDate,
            servings = 1,
            notes
        } = req.body;

        if (!userId || !foodId || !mealType || !logDate) {
            return res.status(400).json({
                error: "userId, foodId, mealType, and logDate are required"
            });
        }

        // Fetch food details to calculate nutritional totals
        const [food] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, parseInt(foodId)))
            .limit(1);

        if (!food) {
            return res.status(404).json({ error: "Food not found" });
        }

        // Calculate nutritional totals based on servings
        const servingMultiplier = parseFloat(servings);
        const newLog = {
            userId: parseInt(userId),
            foodId: parseInt(foodId),
            mealType,
            logDate: new Date(logDate),
            servings: servingMultiplier,
            totalCalories: food.calories ? parseFloat(food.calories) * servingMultiplier : null,
            totalProtein: food.protein ? parseFloat(food.protein) * servingMultiplier : null,
            totalCarbs: food.carbohydrates ? parseFloat(food.carbohydrates) * servingMultiplier : null,
            totalFat: food.fat ? parseFloat(food.fat) * servingMultiplier : null,
            totalFiber: food.fiber ? parseFloat(food.fiber) * servingMultiplier : null,
            totalWater: food.water ? parseFloat(food.water) * servingMultiplier : null,
            notes: notes || null
        };

        const [result] = await db.insert(foodLogs).values(newLog);

        // Fetch the created log with food details
        const [createdLog] = await db
            .select({
                log: foodLogs,
                food: foods
            })
            .from(foodLogs)
            .leftJoin(foods, eq(foodLogs.foodId, foods.id))
            .where(eq(foodLogs.id, result.insertId))
            .limit(1);

        res.status(201).json({
            success: true,
            message: "Food logged successfully",
            log: createdLog
        });
    } catch (error) {
        console.error("Error creating food log:", error);
        res.status(500).json({ error: "Failed to create food log", message: error.message });
    }
});

/**
 * PUT /api/db/food-logs/:id
 * Update a food log entry
 */
router.put("/food-logs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId, servings, mealType, logDate, notes } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Verify log exists and belongs to user
        const [existingLog] = await db
            .select()
            .from(foodLogs)
            .where(
                and(
                    eq(foodLogs.id, parseInt(id)),
                    eq(foodLogs.userId, parseInt(userId))
                )
            )
            .limit(1);

        if (!existingLog) {
            return res.status(404).json({
                error: "Food log not found or you don't have access to it"
            });
        }

        const updates = {};

        // If servings changed, recalculate nutritional totals
        if (servings !== undefined && servings !== existingLog.servings) {
            // Fetch the food to recalculate
            const [food] = await db
                .select()
                .from(foods)
                .where(eq(foods.id, existingLog.foodId))
                .limit(1);

            if (food) {
                const servingMultiplier = parseFloat(servings);
                updates.servings = servingMultiplier;
                updates.totalCalories = food.calories ? parseFloat(food.calories) * servingMultiplier : null;
                updates.totalProtein = food.protein ? parseFloat(food.protein) * servingMultiplier : null;
                updates.totalCarbs = food.carbohydrates ? parseFloat(food.carbohydrates) * servingMultiplier : null;
                updates.totalFat = food.fat ? parseFloat(food.fat) * servingMultiplier : null;
                updates.totalFiber = food.fiber ? parseFloat(food.fiber) * servingMultiplier : null;
                updates.totalWater = food.water ? parseFloat(food.water) * servingMultiplier : null;
            }
        }

        // Update other fields
        if (mealType !== undefined) updates.mealType = mealType;
        if (logDate !== undefined) updates.logDate = new Date(logDate);
        if (notes !== undefined) updates.notes = notes;

        // Perform update
        await db
            .update(foodLogs)
            .set(updates)
            .where(eq(foodLogs.id, parseInt(id)));

        // Fetch updated log with food details
        const [updatedLog] = await db
            .select({
                log: foodLogs,
                food: foods
            })
            .from(foodLogs)
            .leftJoin(foods, eq(foodLogs.foodId, foods.id))
            .where(eq(foodLogs.id, parseInt(id)))
            .limit(1);

        res.json({
            success: true,
            message: "Food log updated successfully",
            log: updatedLog
        });
    } catch (error) {
        console.error("Error updating food log:", error);
        res.status(500).json({ error: "Failed to update food log", message: error.message });
    }
});

/**
 * DELETE /api/db/food-logs/:id
 * Delete a food log entry
 */
router.delete("/food-logs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Verify log exists and belongs to user
        const [existingLog] = await db
            .select()
            .from(foodLogs)
            .where(
                and(
                    eq(foodLogs.id, parseInt(id)),
                    eq(foodLogs.userId, parseInt(userId))
                )
            )
            .limit(1);

        if (!existingLog) {
            return res.status(404).json({
                error: "Food log not found or you don't have access to it"
            });
        }

        // Delete the log entry
        await db
            .delete(foodLogs)
            .where(eq(foodLogs.id, parseInt(id)));

        res.json({
            success: true,
            message: "Food log deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting food log:", error);
        res.status(500).json({ error: "Failed to delete food log", message: error.message });
    }
});

// ==================== FAVORITE FOODS ====================

/**
 * GET /api/db/favorites
 * Get user's favorite foods
 */
router.get("/favorites", async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Get favorite foods with food details
        const results = await db
            .select({
                favorite: favoriteFoods,
                food: foods
            })
            .from(favoriteFoods)
            .innerJoin(foods, eq(favoriteFoods.foodId, foods.id))
            .where(eq(favoriteFoods.userId, parseInt(userId)))
            .orderBy(desc(favoriteFoods.createdAt));

        res.json({
            success: true,
            count: results.length,
            favorites: results
        });
    } catch (error) {
        console.error("Error fetching favorites:", error);
        res.status(500).json({ error: "Failed to fetch favorites", message: error.message });
    }
});

/**
 * POST /api/db/favorites
 * Add a food to favorites
 */
router.post("/favorites", async (req, res) => {
    try {
        const { userId, foodId } = req.body;

        if (!userId || !foodId) {
            return res.status(400).json({ error: "userId and foodId are required" });
        }

        // Check if food exists
        const [food] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, parseInt(foodId)))
            .limit(1);

        if (!food) {
            return res.status(404).json({ error: "Food not found" });
        }

        // Check if already favorited
        const [existing] = await db
            .select()
            .from(favoriteFoods)
            .where(
                and(
                    eq(favoriteFoods.userId, parseInt(userId)),
                    eq(favoriteFoods.foodId, parseInt(foodId))
                )
            )
            .limit(1);

        if (existing) {
            return res.status(409).json({
                error: "Food is already in favorites",
                favorite: existing
            });
        }

        // Add to favorites
        const [result] = await db.insert(favoriteFoods).values({
            userId: parseInt(userId),
            foodId: parseInt(foodId)
        });

        // Fetch the created favorite with food details
        const [createdFavorite] = await db
            .select({
                favorite: favoriteFoods,
                food: foods
            })
            .from(favoriteFoods)
            .innerJoin(foods, eq(favoriteFoods.foodId, foods.id))
            .where(eq(favoriteFoods.id, result.insertId))
            .limit(1);

        res.status(201).json({
            success: true,
            message: "Added to favorites successfully",
            favorite: createdFavorite
        });
    } catch (error) {
        console.error("Error adding favorite:", error);
        res.status(500).json({ error: "Failed to add favorite", message: error.message });
    }
});

/**
 * DELETE /api/db/favorites/:foodId
 * Remove a food from favorites
 */
router.delete("/favorites/:foodId", async (req, res) => {
    try {
        const { foodId } = req.params;
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: "userId is required" });
        }

        // Check if favorite exists
        const [existing] = await db
            .select()
            .from(favoriteFoods)
            .where(
                and(
                    eq(favoriteFoods.userId, parseInt(userId)),
                    eq(favoriteFoods.foodId, parseInt(foodId))
                )
            )
            .limit(1);

        if (!existing) {
            return res.status(404).json({
                error: "Favorite not found"
            });
        }

        // Remove from favorites
        await db
            .delete(favoriteFoods)
            .where(
                and(
                    eq(favoriteFoods.userId, parseInt(userId)),
                    eq(favoriteFoods.foodId, parseInt(foodId))
                )
            );

        res.json({
            success: true,
            message: "Removed from favorites successfully"
        });
    } catch (error) {
        console.error("Error removing favorite:", error);
        res.status(500).json({ error: "Failed to remove favorite", message: error.message });
    }
});

// ==================== UTILITY ENDPOINTS ====================

/**
 * POST /api/db/foods/save-from-api
 * Save a food from FatSecret API to user's database
 */
router.post("/foods/save-from-api", async (req, res) => {
    try {
        const { userId, fatSecretFood } = req.body;

        if (!userId || !fatSecretFood) {
            return res.status(400).json({ error: "userId and fatSecretFood are required" });
        }

        // Check if this FatSecret food is already saved
        if (fatSecretFood.food_id) {
            const [existing] = await db
                .select()
                .from(foods)
                .where(
                    and(
                        eq(foods.userId, parseInt(userId)),
                        eq(foods.fatSecretId, fatSecretFood.food_id.toString())
                    )
                )
                .limit(1);

            if (existing) {
                return res.status(200).json({
                    success: true,
                    message: "Food already saved",
                    food: existing,
                    alreadyExisted: true
                });
            }
        }

        // Map FatSecret API response to our schema
        // Note: FatSecret API structure may vary, adjust mapping as needed
        const servings = fatSecretFood.servings?.serving;
        const serving = Array.isArray(servings) ? servings[0] : servings;

        const newFood = {
            userId: parseInt(userId),
            name: fatSecretFood.food_name || fatSecretFood.name,
            brand: fatSecretFood.brand_name || null,
            fatSecretId: fatSecretFood.food_id ? fatSecretFood.food_id.toString() : null,
            servingSize: serving?.metric_serving_amount ? parseFloat(serving.metric_serving_amount) : null,
            servingUnit: serving?.metric_serving_unit || serving?.serving_description || null,
            calories: serving?.calories ? parseFloat(serving.calories) : null,
            protein: serving?.protein ? parseFloat(serving.protein) : null,
            carbohydrates: serving?.carbohydrate ? parseFloat(serving.carbohydrate) : null,
            fat: serving?.fat ? parseFloat(serving.fat) : null,
            fiber: serving?.fiber ? parseFloat(serving.fiber) : null,
            sugar: serving?.sugar ? parseFloat(serving.sugar) : null,
            sodium: serving?.sodium ? parseFloat(serving.sodium) : null,
            description: fatSecretFood.food_description || null,
            category: fatSecretFood.food_type || null,
            isCustom: false, // From API, not custom
            isVerified: true // API data is considered verified
        };

        const [result] = await db.insert(foods).values(newFood);

        // Fetch the created food
        const [createdFood] = await db
            .select()
            .from(foods)
            .where(eq(foods.id, result.insertId))
            .limit(1);

        res.status(201).json({
            success: true,
            message: "Food saved from API successfully",
            food: createdFood,
            alreadyExisted: false
        });
    } catch (error) {
        console.error("Error saving food from API:", error);
        res.status(500).json({ error: "Failed to save food", message: error.message });
    }
});

export default router;
