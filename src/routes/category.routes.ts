import { Router } from "express";
import { getAllCategory, CreateCategory } from "../controllers/category.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { DeleteCategory } from "../controllers/category.controller";
import { adminMiddleware } from "../middleware/admin.middleware";
import { UpdateCategory } from "../controllers/category.controller";
const router = Router()

router.get("/",getAllCategory)
router.delete("/:id", DeleteCategory)
router.post("/",CreateCategory)
router.patch("/category/:id", UpdateCategory)

export default router;