import { Request, Response } from "express"
import * as bookingService from "../services/booking.service"
import { AuthRequest } from "../middleware/auth.middleware"
import PDFDocument from "pdfkit";
import prisma from "../config/prisma";

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

export const mybookingsdetail = async(req: Request, res: Response) => {
  try {
    const bookingId = Number(req.params.id)
    const bookings = await bookingService.bookingDetails(bookingId)

    res.status(200).json(bookings)
  }  catch(error)
  {
    res.json({
      message: "internal server error"
    })
  }
}
export const downloadInvoice = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        items: { include: { item: true } },
      },
    });

    if (!booking) return res.status(404).json({ message: "Booking tidak ditemukan" });

    // Inisialisasi PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set Header untuk Download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=Invoice-${booking.bookingCode}.pdf`);

    // Stream PDF langsung ke response
    doc.pipe(res);

    // Panggil Service untuk mengisi konten PDF
    bookingService.generateInvoicePDF(doc, booking);

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
