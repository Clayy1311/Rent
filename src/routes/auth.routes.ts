import { Router } from "express"
import { login, register } from "../controllers/auth.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { getMe } from "../controllers/auth.controller"
import { verifyEmail } from "../controllers/auth.controller"
import { get } from "node:http"
import { googleLogin } from "../controllers/auth.controller"
import { googleCallback } from "../controllers/auth.controller"
const router = Router()

router.post("/register", register)
router.post("/login", login)
router.get("/me", authMiddleware, getMe)
router.get("/verify-email", verifyEmail)
router.get("/google",googleLogin)
router.get('/google/callback', googleCallback)
export default router 