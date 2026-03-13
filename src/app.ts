import express from "express"
import cors from "cors"
import cron from "node-cron"
import { cancelExpiredBookings } from "./services/booking.service"
import authRoutes from "./routes/auth.routes"
import itemRoutes from "./routes/item.routes"
import bookingRoutes from "./routes/booking.routes"
import paymentRoutes from "./routes/payment.routes"

const app = express()

app.use(cors())
app.use(express.json())
cron.schedule("* * * * *", async () => {
    console.log("checking expired bookings...")
    await cancelExpiredBookings()
  })
app.use("/auth", authRoutes)
app.use("/items", itemRoutes)
app.use("/bookings", bookingRoutes)
app.use("/payments", paymentRoutes)

export default app