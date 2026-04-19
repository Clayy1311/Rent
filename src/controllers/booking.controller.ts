import { Request, Response } from "express"
import * as bookingService from "../services/booking.service"
import { AuthRequest } from "../middleware/auth.middleware"
import PDFDocument from "pdfkit";

export const createBooking = async (req: Request, res: Response) => {
  try {
    // 1. Ambil data dari body
    const { itemId, startDate, endDate, quantity } = req.body;

    // 2. Ambil userId (Biasanya dari req.user jika pakai middleware Auth)
    // Jika belum ada middleware, sementara bisa pakai dari body atau hardcode
    const userId = (req as any).user?.id || req.body.userId;

    // 3. Validasi input sederhana
    if (!itemId || !startDate || !endDate || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Data booking tidak lengkap (itemId, dates, dan quantity wajib ada)."
      });
    }

    // 4. Panggil service (Di sini logika overlap akan berjalan)
    const newBooking = await bookingService.createBooking(Number(userId), {
      itemId: Number(itemId),
      startDate,
      endDate,
      quantity: Number(quantity)
    });

    // 5. Response Sukses
    return res.status(201).json({
      success: true,
      message: "Booking berhasil dibuat, silakan lakukan pembayaran.",
      data: newBooking
    });

  } catch (error: any) {
    // Jika error berasal dari lemparan "throw new Error" di service (seperti stok habis)
    // maka akan ditangkap di sini.
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const mybookings = async(req: AuthRequest, res: Response) => {

  try {

    const userId = (req as any).user.id

    const bookings = await bookingService.mybookings(userId)

    res.json({
      message: "success",
      data: bookings
    })

  } catch (error) {

    res.status(500).json({
      message: "error get bookings"
    })

  }

}

export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const booking = await bookingService.getBookingForInvoice(Number(id));

    if (!booking) {
      return res.status(404).json({ message: "Booking tidak ditemukan" });
    }

    const doc = new PDFDocument({ margin: 50 });

    // Header HTTP untuk download file
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Invoice-${booking.bookingCode}.pdf`
    );

    doc.pipe(res);

    // --- DESAIN INVOICE ---
    doc.fontSize(20).text("AZKA OUTDOOR", { align: "center" });
    doc.fontSize(10).text("Persewaan Alat Gunung Malang", { align: "center" });
    doc.moveDown();
    doc.hr; // Garis horizontal

    doc.fontSize(12).text(`Invoice: ${booking.bookingCode}`);
    doc.text(`Tanggal: ${new Date().toLocaleDateString()}`);
    doc.text(`Nama Penyewa: ${booking.user.name}`);
    doc.moveDown();

    doc.text("Detail Sewa:", { underline: true });
    booking.items.forEach((item, index) => {
      doc.text(
        `${index + 1}. ${item.item.name} x ${item.quantity} - Rp${item.price.toLocaleString()}`
      );
    });

    doc.moveDown();
    doc.fontSize(14).text(`TOTAL PEMBAYARAN: Rp${booking.totalPrice.toLocaleString()}`, {
      bold: true
    });

    doc.moveDown();
    doc.fontSize(10).text("Status: " + booking.status, {
      color: booking.status === "CONFIRMED" ? "green" : "red"
    });

    doc.end();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
