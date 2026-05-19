import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"
import { snap } from "../config/midtrans"
interface BookingItemInput {
  itemId: number
  quantity: number
}

interface CreateBookingInput {
  userId: number
  startDate: string
  endDate: string
  items: BookingItemInput[]
}



export const createBooking = async (
  userId: number,
  data: {
    items: {
      itemId: number;
      quantity: number;
    }[];
    startDate: string;
    endDate: string;
  }
) => {

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  let totalPrice = 0;

  const validatedItems: {
    itemId: number;
    quantity: number;
    price: number;
  }[] = [];

  for (const cartItem of data.items) {

    const item = await prisma.item.findUnique({
      where: {
        id: cartItem.itemId
      }
    });

    if (!item) {
      throw new Error("Item tidak ditemukan");
    }

    const overlappingBookings =
      await prisma.bookingItem.aggregate({

        _sum: {
          quantity: true
        },

        where: {
          itemId: cartItem.itemId,

          booking: {
            status: {
              in: [
                BookingStatus.PENDING_PAYMENT,
                BookingStatus.WAITING_CONFIRMATION,
                BookingStatus.CONFIRMED,
                BookingStatus.RENTED
              ]
            },

            AND: [
              {
                startDate: {
                  lte: end
                }
              },

              {
                endDate: {
                  gte: new Date(
                    start.getTime() -
                    (24 * 60 * 60 * 1000)
                  )
                }
              }
            ]
          }
        }

      });

    const bookedQuantity =
      overlappingBookings._sum.quantity || 0;

    const availableStock =
      item.stock - bookedQuantity;

    if (cartItem.quantity > availableStock) {
      throw new Error(
        `Stok ${item.name} tidak mencukupi. Tersedia: ${availableStock}`
      );
    }

    totalPrice +=
      item.price * cartItem.quantity;

    validatedItems.push({
      itemId: item.id,
      quantity: cartItem.quantity,
      price: item.price
    });

  }

  const bookingCode =
    `INV-${Date.now()}-${userId}`;

  const result =
    await prisma.$transaction(async (tx) => {

      const newBooking =
        await tx.booking.create({

          data: {
            userId,
            bookingCode,
            startDate: start,
            endDate: end,
            totalPrice,

            status:
              BookingStatus.PENDING_PAYMENT,

            expiredAt:
              new Date(
                Date.now() + 15 * 60 * 1000
              ),
          }

        });

      for (const item of validatedItems) {

        await tx.bookingItem.create({

          data: {
            bookingId: newBooking.id,
            itemId: item.itemId,
            quantity: item.quantity,
            price: item.price
          }

        });

      }

      return newBooking;

    });

  const transaction =
    await snap.createTransaction({ 

      transaction_details: {
        order_id: result.bookingCode!,
        gross_amount: result.totalPrice
      },
        callbacks: {
      finish: "http://localhost:3000/history"
   }

    });

  return {
    booking: result,
    token: transaction.token
  };

};

// ============================================
// CANCEL BOOKING JIKA EXPIRED
// ============================================

export const cancelExpiredBookings =
async () => {

  const expiredBookings =
    await prisma.booking.findMany({

      where: {

        status: "PENDING_PAYMENT",

        expiredAt: {
          lt: new Date()
        }

      }

    });

  if (expiredBookings.length === 0) {
    return;
  }

  console.log(
    `Found ${expiredBookings.length} expired bookings`
  );

  for (const booking of expiredBookings) {

    await prisma.booking.update({

      where: {
        id: booking.id
      },

      data: {
        status: BookingStatus.EXPIRED
      }

    });

  }

};


export const mybookings = async (userId: number) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
      status: {
        in: ['CONFIRMED','FINISHED','RENTED']
      }
    },
    include: {
      items: {
        include: {
          item: true
        }
      },
      payment: true
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return bookings
}

export const bookingDetails = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId, // Mencari berdasarkan field 'id'
    },
    include: {
      items: {
        include: {
          item: true, // Sekalian ambil detail nama barangnya
        },
      },
      user: true, // Sekalian ambil detail siapa yang menyewa
      payment: true, // Sekalian ambil status pembayarannya
    },
  });

  return booking;
};

export const generateInvoicePDF = (doc: PDFKit.PDFDocument, booking: any) => {
  // 1. HITUNG DURASI
  const diff = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
  const duration = Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1;

  // 2. HEADER (BRANDING)
  doc.fillColor("#2d3436").fontSize(22).text("AZKA OUTDOOR", { align: "right" });
  doc.fontSize(10).text("Persewaan Alat Gunung & Camping Tuban", { align: "right" });
  doc.text("Maibit, Desa Rengel, Tuban", { align: "right" });
  doc.text("WA: 0800-000-00 | IG: @azkaoutdoor", { align: "right" });
  doc.moveDown();

  doc.moveTo(50, 115).lineTo(550, 115).strokeColor("#dfe6e9").stroke();
  doc.moveDown(2);

  // 3. INFORMASI TRANSAKSI
  const startY = doc.y;
  doc.fillColor("#000000").fontSize(14).text("INVOICE PEMBAYARAN", { underline: true });
  doc.fontSize(10).moveDown(0.5);
  
  doc.text(`Nama Penyewa : ${booking.user.name}`);
  doc.text(`Email        : ${booking.user.email}`);
  const statusColor = booking.status === "CONFIRMED" ? "#27ae60" : "#e74c3c";
  doc.fillColor(statusColor).text(`Status       : ${booking.status}`).fillColor("#000000");

  doc.text(`Kode Booking : ${booking.bookingCode}`, 350, startY + 25);
  doc.text(`Tanggal Sewa : ${new Date(booking.startDate).toLocaleDateString('id-ID')}`, 350);
  doc.text(`Tanggal Balik: ${new Date(booking.endDate).toLocaleDateString('id-ID')}`, 350);
  doc.text(`Durasi       : ${duration} Hari`, 350);

  doc.moveDown(4);

  // 4. TABEL DETAIL BARANG
  const tableTop = doc.y;
  doc.fillColor("#2d3436").fontSize(11);
  
  doc.text("Item / Paket", 50, tableTop, { bold: true });
  doc.text("Qty", 280, tableTop, { bold: true });
  doc.text("Harga (Hari)", 350, tableTop, { bold: true });
  doc.text("Subtotal", 480, tableTop, { bold: true });
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor("#000000").stroke();
  
  let currentY = tableTop + 25;

  booking.items.forEach((item: any) => {
    const itemSubtotal = item.price * item.quantity * duration;
    doc.text(item.item.name, 50, currentY);
    doc.text(item.quantity.toString(), 280, currentY);
    doc.text(`Rp${item.price.toLocaleString()}`, 350, currentY);
    doc.text(`Rp${itemSubtotal.toLocaleString()}`, 480, currentY);
    currentY += 20;
  });

  // 5. TOTAL & FOOTER
 // 5. TOTAL & FOOTER
 doc.moveTo(50, currentY + 10).lineTo(550, currentY + 10).stroke();
 doc.moveDown(2);
 
 doc.fontSize(14).fillColor("#d63031").text(
   `TOTAL PEMBAYARAN: Rp${booking.totalPrice.toLocaleString()}`, 
   { align: "right", bold: true }
 );

 doc.moveDown(4);
 doc.fillColor("#636e72").fontSize(9);
 doc.text("Syarat & Ketentuan:", { underline: true, bold: true });
 doc.moveDown(0.3);
 
 // Penambahan aturan Jam Operasional yang kamu minta
 doc.text("1. Pengambilan barang minimal dilakukan pada hari mulai sewa mulai pukul 06.00 WIB.");
 doc.text("2. Pengembalian barang maksimal dilakukan pada hari berakhir sewa pukul 23.59 WIB (Jam 12 Malam).");
 doc.text("3. Keterlambatan pengembalian melewati batas waktu akan dikenakan DENDA sesuai tarif yang berlaku.");
 doc.text("4. Harap membawa KTP/KTM asli sebagai jaminan saat pengambilan alat.");
 doc.text("5. Segala kerusakan atau kehilangan alat menjadi tanggung jawab penuh penyewa.");

 doc.moveDown(2);
 doc.fillColor("#2d3436").fontSize(10).text(
   "Terima kasih telah mempercayakan petualangan Anda pada Azka Outdoor!", 
   { align: "center", italic: true }
 );

 doc.end();
};