import { BookingStatus } from "@prisma/client";

/**
 * Fungsi ini menghasilkan filter untuk mengecek booking yang sedang berjalan
 * dan benar-benar memotong stok (Confirmed/Rented atau Pending < 15 menit).
 */
export const getActiveStockFilter = () => {
  const expirationTime = 15; // menit
  const expiredLimit = new Date(Date.now() - expirationTime * 60 * 1000);

  return {
    OR: [
      // 1. Status yang sudah pasti memotong stok
      { 
        status: { 
          in: [BookingStatus.CONFIRMED, BookingStatus.RENTED] 
        } 
      },
      // 2. Status pending yang belum expired
      {
        AND: [
          { status: BookingStatus.PENDING_PAYMENT },
          { createdAt: { gte: expiredLimit } }
        ]
      }
    ]
  };
};