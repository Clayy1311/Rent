import { Router } from "express"
import {
  uploadPayment,
  verifyPayment
} from "../controllers/payment.controller"

import { upload } from "../middleware/upload.middleware"
import { authMiddleware } from "../middleware/auth.middleware"
import { adminMiddleware } from "../middleware/admin.middleware"
import { midtransWebhookController } from "../controllers/payment.controller"

const router = Router()
router.post("/webhook", midtransWebhookController)
router.post(
  "/:bookingId",
  authMiddleware,
  upload.single("paymentProof"),
  uploadPayment
)



router.post(
  "/:bookingId/verify",
  authMiddleware,
  adminMiddleware,
  verifyPayment
)

export default router