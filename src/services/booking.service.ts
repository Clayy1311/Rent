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

export const createBooking = async (data: CreateBookingInput) => {

  const { userId, startDate, endDate, items } = data

  const start = new Date(startDate)
  const end = new Date(endDate)

  // hitung durasi sewa
  const duration = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (duration <= 0) {
    throw new Error("Invalid booking date")
  }

  // ambil semua item dari database
  const itemIds = items.map(i => i.itemId)

  const dbItems = await prisma.item.findMany({
    where: {
      id: { in: itemIds }
    }
  })

  let totalPrice = 0

  // validasi stok + hitung harga
  for (const item of items) {

    const dbItem = dbItems.find(i => i.id === item.itemId)

    if (!dbItem) {
      throw new Error("Item not found")
    }

    if (item.quantity > dbItem.stock) {
      throw new Error(`Stock not enough for item ${dbItem.name}`)
    }

    const itemPrice =
      dbItem.price * item.quantity * duration

    totalPrice += itemPrice
  }

  // expired booking (5 menit)
  const expiredAt = new Date()
  expiredAt.setMinutes(expiredAt.getMinutes() + 5)

  // transaction
  const booking = await prisma.$transaction(async (tx) => {

    const newBooking = await tx.booking.create({
      data: {
        userId,
        startDate: start,
        endDate: end,
        totalPrice,
        status: "PENDING_PAYMENT",
        expiredAt
      }
    })

    for (const item of items) {

      const dbItem = dbItems.find(i => i.id === item.itemId)!

      // simpan booking item
      await tx.bookingItem.create({
        data: {
          bookingId: newBooking.id,
          itemId: item.itemId,
          quantity: item.quantity,
          price: dbItem.price
        }
      })

      // reserve stok
      await tx.item.update({
        where: { id: item.itemId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      })
    }

    return newBooking
  })

  return booking
}


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