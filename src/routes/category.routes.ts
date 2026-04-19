import { Router } from "express";
import { getAllCategory, CreateCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
const router = Router()

router.get("/",getAllCategory)
router.post("/",CreateCategory)

export default router;