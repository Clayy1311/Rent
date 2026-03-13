import prisma from "../config/prisma"
import { generateBookingCode } from "../utils/generateCode"

export const uploadPayment = async (
  bookingId: number,
  filePath: string
) => { 
 const booking = await prisma.booking.findUnique({
        where: { id: bookingId }
      })
    
      if (!booking) {
        throw new Error("Booking not found")
      }
      if (booking.status !== "PENDING_PAYMENT") {
        throw new Error("Booking already paid")
      }
      const payment = await prisma.payment.create({
        data: {
          bookingId: bookingId,
          amount: booking.totalPrice,
          paymentProof: filePath,
          status: "PENDING"
        }
      })
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "WAITING_CONFIRMATION"
        }
      })
      return payment
    }

    export const verifyPayment = async (bookingId: number) => {
        const payment = await prisma.payment.findUnique({
            where: { bookingId }
          })
        
          if (!payment) {
            throw new Error("Payment not found")
          }
          await prisma.payment.update({
            where: { bookingId },
            data: {
              status: "VERIFIED"
            }
          })
          const bookingCode = generateBookingCode()
          const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: {
              status: "CONFIRMED",
              bookingCode
            }
          })
          return booking
        }