import CryptoJS from "crypto-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const baseURL = "https://platform.fatsecret.com/rest/server.api";
const consumerKey = process.env.FATSECRET_CONSUMER_KEY;
const consumerSecret = process.env.FATSECRET_CONSUMER_SECRET;

/**
 * Generate OAuth 1.0 signature
 */
function generateOAuthSignature(method, url, params, consumerSecret) {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
        .sort()
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join("&");

    // Create signature base string
    const signatureBaseString = `${method.toUpperCase()}&${encodeURIComponent(
        url
    )}&${encodeURIComponent(sortedParams)}`;

    // Generate signature using HMAC-SHA1
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    const signature = CryptoJS.HmacSHA1(signatureBaseString, signingKey);

    return CryptoJS.enc.Base64.stringify(signature);
}

/**
 * Generate OAuth 1.0 parameters
 */
function generateOAuthParams(method, url, additionalParams = {}) {
    const oauthParams = {
        oauth_consumer_key: consumerKey,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15),
        oauth_version: "1.0",
        ...additionalParams,
    };

    // Generate signature with all parameters
    const signature = generateOAuthSignature(method, url, oauthParams, consumerSecret);
    oauthParams.oauth_signature = signature;

    return oauthParams;
}

/**
 * Make authenticated request to FatSecret API using OAuth 1.0
 */
async function makeRequest(method, params = {}) {
    try {
        // Add method parameter
        const requestParams = {
            ...params,
            method: method,
            format: "json",
        };

        // Generate OAuth parameters
        const oauthParams = generateOAuthParams("POST", baseURL, requestParams);

        // Combine all parameters
        const allParams = new URLSearchParams(oauthParams);

        const response = await fetch(baseURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: allParams.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[FatSecret] Error Response: ${errorText}`);
            throw new Error(`API request failed: ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("[FatSecret] Error making request:", error.message);
        throw error;
    }
}

/**
 * Search for foods
 */
export async function searchFoods(searchExpression, pageNumber = 0, maxResults = 20) {
    return await makeRequest("foods.search", {
        search_expression: searchExpression,
        page_number: pageNumber,
        max_results: maxResults,
    });
}

/**
 * Get food by ID
 */
export async function getFoodById(foodId) {
    const response = await makeRequest("food.get", {
        food_id: foodId,
    });
    
    // Handle different response structures from FatSecret API
    if (response.food && !response.foods) {
        // Standard food.get response: { food: { ... } }
        return response.food;
    } else if (response.food_id && response.food_name) {
        // Direct food object
        return response;
    } else if (response.foods && response.foods.food) {
        // This shouldn't happen with food.get - it means wrong route was called
        console.error("[FatSecret] ERROR: Received search result format instead of detail format for food ID:", foodId);
        throw new Error("FatSecret API returned unexpected format. Please try again.");
    } else {
        console.error("[FatSecret] Unknown response format:", response);
        throw new Error("Unknown response format from FatSecret API");
    }
}

/**
 * Autocomplete food search (Premier only)
 */
export async function autocompleteFoodSearch(expression, maxResults = 10) {
    return await makeRequest("foods.autocomplete", {
        expression: expression,
        max_results: maxResults,
    });
}

/**
 * Search for recipes
 */
export async function searchRecipes(searchExpression, pageNumber = 0, maxResults = 20) {
    return await makeRequest("recipes.search", {
        search_expression: searchExpression,
        page_number: pageNumber,
        max_results: maxResults,
    });
}

/**
 * Get recipe by ID
 */
export async function getRecipeById(recipeId) {
    return await makeRequest("recipe.get", {
        recipe_id: recipeId,
    });
}

/**
 * Get all food categories
 */
export async function getFoodCategories() {
    return await makeRequest("food_categories.get", {});
}

/**
 * Get all food sub-categories
 */
export async function getFoodSubCategories() {
    return await makeRequest("food_sub_categories.get", {});
}

/**
 * Get all recipe types
 */
export async function getRecipeTypes() {
    return await makeRequest("recipe_types.get", {});
}

/**
 * Barcode scanning
 */
export async function scanBarcode(barcode) {
    return await makeRequest("food.find_id_for_barcode", {
        barcode: barcode,
    });
}
