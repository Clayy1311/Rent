import { Router } from "express"
import { getItems, createItem } from "../controllers/item.controller"
import {adminMiddleware} from "../middleware/admin.middleware"
import { authMiddleware } from "../middleware/auth.middleware"
import { upload } from "../middleware/upload.middleware"
import { getAvailableItems } from "../controllers/item.controller"
import { deleteItem } from "../controllers/item.controller"
import { updateItem } from "../controllers/item.controller"

const router = Router()

router.get("/", getItems)
router.post("/", upload.single("image"), createItem);
router.delete("/:id", authMiddleware, adminMiddleware, deleteItem)
router.put("/:id", upload.single('image'), authMiddleware,adminMiddleware,updateItem)
router.get("/available", getAvailableItems )

export default router