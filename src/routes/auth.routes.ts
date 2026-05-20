import { Router } from "express"
import { login, register } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { getMe } from "../controllers/auth.controller"
import { verifyEmail } from "../controllers/auth.controller"
import { get } from "node:http"
const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.get("/verify-email", verifyEmail)

export default router 