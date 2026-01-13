import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { eq } from "drizzle-orm";

const router = express.Router();
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
    try {
        const { username, email, password, firstName, lastName } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                error: "Username, email, and password are required",
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: "Invalid email format",
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long",
            });
        }

        // Check if username already exists
        const [existingUsername] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (existingUsername) {
            return res.status(409).json({
                error: "Username already exists",
            });
        }

        // Check if email already exists
        const [existingEmail] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (existingEmail) {
            return res.status(409).json({
                error: "Email already exists",
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const [newUser] = await db
            .insert(users)
            .values({
                username,
                email: email.toLowerCase(),
                passwordHash,
                firstName: firstName || null,
                lastName: lastName || null,
            });

        // Fetch created user (without password)
        const [createdUser] = await db
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
            })
            .from(users)
            .where(eq(users.id, newUser.insertId))
            .limit(1);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: createdUser,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({
            error: "Failed to register user",
            message: error.message,
        });
    }
});

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        // Validate required fields
        if (!emailOrUsername || !password) {
            return res.status(400).json({
                error: "Email/username and password are required",
            });
        }

        // Find user by email or username
        const [user] = await db
            .select()
            .from(users)
            .where(
                eq(users.email, emailOrUsername.toLowerCase())
            )
            .limit(1);

        // If not found by email, try username
        let foundUser = user;
        if (!foundUser) {
            const [userByUsername] = await db
                .select()
                .from(users)
                .where(eq(users.username, emailOrUsername))
                .limit(1);
            foundUser = userByUsername;
        }

        if (!foundUser) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, foundUser.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid credentials",
            });
        }

        // Return user data (without password)
        const userData = {
            id: foundUser.id,
            username: foundUser.username,
            email: foundUser.email,
            firstName: foundUser.firstName,
            lastName: foundUser.lastName,
            profilePicture: foundUser.profilePicture,
            goalCalories: foundUser.goalCalories,
            goalProtein: foundUser.goalProtein,
            goalCarbs: foundUser.goalCarbs,
            goalFat: foundUser.goalFat,
            createdAt: foundUser.createdAt,
        };

        res.json({
            success: true,
            message: "Login successful",
            user: userData,
        });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({
            error: "Failed to login",
            message: error.message,
        });
    }
});

/**
 * POST /api/auth/verify
 * Verify if user is still authenticated (for session restoration)
 */
router.post("/verify", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                error: "User ID is required",
            });
        }

        // Fetch user
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
            })
            .from(users)
            .where(eq(users.id, parseInt(userId)))
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
        console.error("Error verifying user:", error);
        res.status(500).json({
            error: "Failed to verify user",
            message: error.message,
        });
    }
});

export default router;
