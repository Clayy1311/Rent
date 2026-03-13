import { Router } from "express"
import { getItems, createItem } from "../controllers/item.controller"
import {adminMiddleware} from "../middleware/admin.middleware"
import { authMiddleware } from "../middleware/auth.middleware"

const router = Router()

router.get("/", getItems)
router.post("/admin",authMiddleware, adminMiddleware, createItem)

export default router