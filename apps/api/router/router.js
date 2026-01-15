import { Router } from "express";
import foodController from "../controller/foodController.js";
import foodDBController from "../controller/foodDBController.js";
import userController from "../controller/userController.js";
import authController from "../controller/authController.js";
import glpController from "../controller/glpController.js";

const router = Router();

// Authentication routes
router.use("/api/auth", authController);

// FatSecret API routes
router.use("/api", foodController);

// Database routes
router.use("/api/db", foodDBController);
router.use("/api/db", userController);
router.use("/api/db", glpController);

export default router;