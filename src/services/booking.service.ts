import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"
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


export const createBooking = async (userId: number, data: {
  itemId: number;
  startDate: string;
  endDate: string;
  quantity: number;
}) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  // 1. Ambil data Item untuk cek stok total dan harga
  const item = await prisma.item.findUnique({
    where: { id: data.itemId }
  });

  if (!item) throw new Error("Item tidak ditemukan");

  // 2. CEK OVERLAP & STOK (Core Logic)
  // Cari booking yang bentrok di tanggal tersebut
  const overlappingBookings = await prisma.bookingItem.aggregate({
    _sum: { quantity: true },
    where: {
      itemId: data.itemId,
      booking: {
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.RENTED, BookingStatus.WAITING_CONFIRMATION]
        },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    }
  });

  const bookedQuantity = overlappingBookings._sum.quantity || 0;
  const availableStock = item.stock - bookedQuantity;

  if (data.quantity > availableStock) {
    throw new Error(`Stok tidak mencukupi. Tersedia: ${availableStock}, Anda meminta: ${data.quantity}`);
  }

  // 3. JALANKAN TRANSACTION
  const totalPrice = item.price * data.quantity;
  const bookingCode = `INV-${Date.now()}-${userId}`;

  return await prisma.$transaction(async (tx) => {
    // A. Buat Header Booking
    const newBooking = await tx.booking.create({
      data: {
        userId,
        bookingCode,
        startDate: start,
        endDate: end,
        totalPrice,
        status: BookingStatus.PENDING_PAYMENT,
      }
    });

    // B. Buat Detail Booking (BookingItem)
    await tx.bookingItem.create({
      data: {
        bookingId: newBooking.id,
        itemId: data.itemId,
        quantity: data.quantity,
        price: item.price // Simpan harga saat ini (fixed)
      }
    });

    return newBooking;
  });
};


// ============================================
// CANCEL BOOKING JIKA EXPIRED
// ============================================

export const cancelExpiredBookings = async () => {

  const expiredBookings = await prisma.booking.findMany({
    where: {
      status: "PENDING_PAYMENT",
      expiredAt: {
        lt: new Date()
      }
    },
    include: {
      items: true
    }
  })

  if (expiredBookings.length === 0) {
    return
  }

  console.log(`Found ${expiredBookings.length} expired bookings`)

  for (const booking of expiredBookings) {

    for (const item of booking.items) {

      await prisma.item.update({
        where: { id: item.itemId },
        data: {
          stock: {
            increment: item.quantity
          }
        }
      })
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: BookingStatus.EXPIRED
      }
    })
  }
}


export const mybookings = async (userId: number) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId
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


export const getBookingForInvoice = async (bookingId: number) => {
  return await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      items: {
        include: {
          item: true
        }
      },
      payment: true
    }
  });
};