import express from "express";
import * as fatSecretService from "../services/fatSecretService.js";

const router = express.Router();

// Search for foods
router.get("/foods/search", async (req, res) => {
    try {
        const { query, page = 0, maxResults = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                error: "Search query is required",
            });
        }

        const results = await fatSecretService.searchFoods(
            query,
            parseInt(page),
            parseInt(maxResults)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: "Failed to search foods",
            message: error.message,
        });
    }
});
// Autocomplete food search
router.get("/foods/autocomplete", async (req, res) => {
    try {
        const { query, maxResults = 10 } = req.query;

        if (!query) {
            return res.status(400).json({
                error: "Search query is required",
            });
        }

        const results = await fatSecretService.autocompleteFoodSearch(
            query,
            parseInt(maxResults)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: "Failed to autocomplete foods",
            message: error.message,
        });
    }
});

// Get food by ID - MUST come after specific routes like /foods/search and /foods/autocomplete
router.get("/foods/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "Food ID is required",
            });
        }

        const food = await fatSecretService.getFoodById(id);

        // Validate that we have the correct structure
        if (!food || typeof food !== 'object') {
            return res.status(500).json({
                error: "Invalid food data received from FatSecret API",
                message: "The food data is not in the expected format",
            });
        }

        // Check if the food has the required serving information
        if (!food.servings || !food.servings.serving) {
            return res.status(400).json({
                error: "Food detail incomplete",
                message: "This food item does not have detailed serving information available",
                food: food, // Return what we have so the client can handle it
            });
        }

        res.json(food);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get food details",
            message: error.message,
        });
    }
});

// Search for recipes
router.get("/recipes/search", async (req, res) => {
    try {
        const { query, page = 0, maxResults = 20 } = req.query;

        if (!query) {
            return res.status(400).json({
                error: "Search query is required",
            });
        }

        const results = await fatSecretService.searchRecipes(
            query,
            parseInt(page),
            parseInt(maxResults)
        );

        res.json(results);
    } catch (error) {
        res.status(500).json({
            error: "Failed to search recipes",
            message: error.message,
        });
    }
});

// Get recipe by ID
router.get("/recipes/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "Recipe ID is required",
            });
        }

        const recipe = await fatSecretService.getRecipeById(id);
        res.json(recipe);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get recipe details",
            message: error.message,
        });
    }
});

// Get all food categories
router.get("/categories", async (req, res) => {
    try {
        const categories = await fatSecretService.getFoodCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get food categories",
            message: error.message,
        });
    }
});

// Get all food sub-categories
router.get("/subcategories", async (req, res) => {
    try {
        const subcategories = await fatSecretService.getFoodSubCategories();
        res.json(subcategories);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get food sub-categories",
            message: error.message,
        });
    }
});

// Get all recipe types
router.get("/recipe-types", async (req, res) => {
    try {
        const recipeTypes = await fatSecretService.getRecipeTypes();
        res.json(recipeTypes);
    } catch (error) {
        res.status(500).json({
            error: "Failed to get recipe types",
            message: error.message,
        });
    }
});

// Scan barcode
router.get("/barcode/:code", async (req, res) => {
    try {
        const { code } = req.params;

        if (!code) {
            return res.status(400).json({
                error: "Barcode is required",
            });
        }

        const result = await fatSecretService.scanBarcode(code);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: "Failed to scan barcode",
            message: error.message,
        });
    }
});

// Health check endpoint
router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "FatSecret API Integration",
        timestamp: new Date().toISOString(),
    });
});

export default router;