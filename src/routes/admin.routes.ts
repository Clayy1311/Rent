import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminMiddleware } from "../middleware/admin.middleware";
import { getDashboardData } from "../controllers/admin.controller";
import { getBookings } from "../controllers/admin.controller";
import { verifyPayment } from "../controllers/payment.controller";
import { getReports } from "../controllers/admin.controller";
import { downloadExcelReport } from "../controllers/admin.controller";
import { handleReturn } from "../controllers/admin.controller";
import { handlePickUp } from "../controllers/admin.controller";
import { getDetail } from "../controllers/admin.controller";
const router = Router()
router.patch("/bookings/:id/pickup", authMiddleware,adminMiddleware,handlePickUp);
router.patch("/bookings/:id/return", authMiddleware,adminMiddleware,handleReturn);
router.get("/stats", authMiddleware,adminMiddleware, getDashboardData)
router.get("/allBookings", authMiddleware,adminMiddleware, getBookings)
router.get("/booking/getDetail/:id", authMiddleware,adminMiddleware, getDetail  )
router.post("/verify/:id", authMiddleware,adminMiddleware,verifyPayment)
router.get("/reports", authMiddleware,adminMiddleware, getReports)
router.get("/reports/donwload", authMiddleware, adminMiddleware, downloadExcelReport)

export default router;