import express from "express"
import cors from "cors"
import cron from "node-cron"
import { cancelExpiredBookings } from "./services/booking.service"
import authRoutes from "./routes/auth.routes"
import itemRoutes from "./routes/item.routes"
import bookingRoutes from "./routes/booking.routes"
import paymentRoutes from "./routes/payment.routes"
import categoryRoutes from "./routes/category.routes"
import packageRoutes from "./routes/package.routes"
import path from "node:path"
import { fileURLToPath } from "node:url" // <--- Tambahkan ini
import adminRoutes from "./routes/admin.routes"

// --- Tambahkan 2 baris ini untuk fix __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads");
console.log("Gambar dibaca dari folder:", uploadsPath);
// ------------------------------------------------

const app = express()

app.use(cors())
app.use(express.json())

cron.schedule("* * * * *", async () => {
    console.log("checking expired bookings...")
    await cancelExpiredBookings()
})

// Sekarang __dirname sudah bisa dipakai
app.use("/uploads", express.static(uploadsPath));


app.use("/auth", authRoutes)
app.use("/items", itemRoutes)
app.use("/bookings", bookingRoutes)
app.use("/payments", paymentRoutes)
app.use("/category", categoryRoutes)
app.use("/package",packageRoutes)
app.use("/admin",adminRoutes)

export default app