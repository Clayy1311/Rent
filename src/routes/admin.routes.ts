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
import { getMonthlyRevenue } from "../controllers/admin.controller";
import { getRentController } from "../controllers/admin.controller";
import { getStatusController } from "../controllers/admin.controller";
import { getItemBestSellingController } from "../controllers/admin.controller";
import { getAllUsers } from "../controllers/admin.controller";
import { createAdminBookingController } from "../controllers/admin.controller";
import { getTotalrevenueController } from "../controllers/admin.controller";
import { GetAllTransaction } from "../controllers/admin.controller";
import { ArchiveItem } from "../controllers/admin.controller";
import { UnarchiveItem } from "../controllers/admin.controller";
import { ArchivePackage } from "../controllers/admin.controller";
import { UnarchivePackage } from "../controllers/admin.controller";
import { ArchiveCategory } from "../controllers/admin.controller";
import { UnarchiveCategory } from "../controllers/admin.controller";
import { GetAllArchiveCategory } from "../controllers/admin.controller";
import { GetAllArchiveItem } from "../controllers/admin.controller";
import { GetAllArchivePackage } from "../controllers/admin.controller";
const router = Router()
router.patch("/bookings/:id/pickup", authMiddleware,adminMiddleware,handlePickUp);
router.patch("/bookings/:id/return", authMiddleware,adminMiddleware,handleReturn);
router.get("/stats", authMiddleware,adminMiddleware, getDashboardData)
router.get("/allBookings", authMiddleware,adminMiddleware, getBookings)
router.get("/booking/getDetail/:id", authMiddleware,adminMiddleware, getDetail  )
router.post("/verify/:id", authMiddleware,adminMiddleware,verifyPayment)
router.get("/reports", authMiddleware,adminMiddleware, getReports)
router.get("/revenue", authMiddleware,adminMiddleware,getMonthlyRevenue)
router.get("/rent", authMiddleware,adminMiddleware, getRentController)
router.get("/status", authMiddleware, adminMiddleware, getStatusController)
router.get('/bestselling', authMiddleware, adminMiddleware,getItemBestSellingController)
router.get("/users", authMiddleware, adminMiddleware, getAllUsers)
router.get("/reports/donwload", authMiddleware, adminMiddleware, downloadExcelReport)
router.post("/createbooking", authMiddleware,adminMiddleware, createAdminBookingController)
router.get("/revenue-summary", authMiddleware,adminMiddleware,getTotalrevenueController)
router.get("/transaction", authMiddleware,adminMiddleware,GetAllTransaction)
router.patch("/item/archive/:id", authMiddleware, adminMiddleware, ArchiveItem)
router.patch("/item/unarchive/:id", authMiddleware, adminMiddleware, UnarchiveItem)
router.patch("/package/archive/:id",authMiddleware, adminMiddleware, ArchivePackage)
router.patch("/package/unarchive/:id", authMiddleware, adminMiddleware, UnarchivePackage)
router.patch("/category/archive/:id",authMiddleware, adminMiddleware,ArchiveCategory)
router.patch("/category/unarchive/:id", authMiddleware, adminMiddleware, UnarchiveCategory)
router.get("/item/archive", authMiddleware, adminMiddleware, GetAllArchiveItem)
router.get("/package/archive", authMiddleware, adminMiddleware, GetAllArchivePackage)
router.get("/category/archive", authMiddleware, adminMiddleware, GetAllArchiveCategory)
export default router;