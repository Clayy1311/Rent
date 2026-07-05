import { Request, Response } from "express"
import * as bookingService from "../services/booking.service"
import { AuthRequest } from "../middleware/auth.middleware"
import PDFDocument from "pdfkit";
import prisma from "../config/prisma";
import { snap } from "../config/midtrans";

export const createBooking = async (
  req: Request,
  res: Response
) => {

  try {

    const {
      items,
      startDate,
      endDate
    } = req.body;

    const userId =
      (req as any).user?.id ||
      req.body.userId;

      

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !startDate ||
      !endDate
    ) {

      return res.status(400).json({
        success: false,
        message:
          "Data booking tidak lengkap."
      });

    }

    const newBooking =
      await bookingService.createBooking(
        Number(userId),
        {
          items,
          startDate,
          endDate
        }
      );

    return res.status(201).json({
      success: true,
      message:
        "Booking berhasil dibuat, silakan lakukan pembayaran.",
      data: newBooking
    });

  } catch (error: any) {

    return res.status(400).json({
      success: false,
      message: error.message
    });

  }

};

export const mybookings = async(req: AuthRequest, res: Response) => {

  try {

    const userId = Number(req.params.id);

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
