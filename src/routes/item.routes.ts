import { Router } from "express"
import { getItems, createItem } from "../controllers/item.controller"
import {adminMiddleware} from "../middleware/admin.middleware"
import { authMiddleware } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"

const router = Router()

router.get("/", getItems)
router.post("/", upload.single("image"), createItem);

export default router