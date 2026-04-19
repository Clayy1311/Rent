import express from "express"
import {Router} from "express"
import {createBooking} from "../controllers/booking.controller"
import { authMiddleware } from "../middleware/auth.middleware"
import { mybookings, downloadInvoice } from "../controllers/booking.controller"
const router = express.Router()

router.post("/",authMiddleware, createBooking)
router.get("/mybookings", authMiddleware, mybookings)
router.get("/:id/invoice", downloadInvoice);

export default router