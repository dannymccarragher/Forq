import { Router } from "express";
import foodController from "../controller/foodController.js";
import foodDBController from "../controller/foodDBController.js";
import userController from "../controller/userController.js";

const router = Router();

// FatSecret API routes
router.use("/api", foodController);

// Database routes
router.use("/api/db", foodDBController);
router.use("/api/db", userController);

export default router;