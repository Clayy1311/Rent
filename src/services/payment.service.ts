import prisma from "../config/prisma"
import { generateBookingCode } from "../utils/generateCode"



export const midtransWebhookService =
  async (payload: any) => {

    const {
      order_id,
      transaction_status,
      payment_type,
      fraud_status,
    } = payload;

    console.log("MIDTRANS WEBHOOK:");
    console.log(payload);

    // =========================
    // CARI BOOKING
    // =========================
    const booking =
      await prisma.booking.findFirst({
        where: {
          bookingCode: order_id
        }
      });

    if (!booking) {
      throw new Error(
        "Booking tidak ditemukan"
      );
    }

    // =========================
    // PAYMENT SUCCESS
    // =========================
    if (
      transaction_status === "settlement" ||
      transaction_status === "capture"
    ) {

      // UPDATE BOOKING
      await prisma.booking.update({
        where: {
          id: booking.id
        },

        data: {
          status: "CONFIRMED"
        }
      });

      // CREATE / UPDATE PAYMENT
      await prisma.payment.upsert({

        where: {
          bookingId: booking.id
        },

        update: {
          status: "VERIFIED"
        },

        create: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          paymentProof: "MIDTRANS",
          status: "VERIFIED"
        }

      });

    }

    // =========================
    // EXPIRED
    // =========================
    else if (
      transaction_status === "expire"
    ) {

      await prisma.booking.update({

        where: {
          id: booking.id
        },

        data: {
          status: "EXPIRED"
        }

      });

    }

    // =========================
    // CANCEL / DENY
    // =========================
    else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {

      await prisma.booking.update({

        where: {
          id: booking.id
        },

        data: {
          status: "CANCELLED"
        }

      });

    }
    console.log("MIDTRANS WEBHOOK:");
console.log(payload);

console.log("ORDER ID:", order_id);
console.log("TRANSACTION STATUS:", transaction_status);

    return booking;
};
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