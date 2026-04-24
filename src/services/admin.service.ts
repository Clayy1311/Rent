import prisma from "../config/prisma";
import { BookingStatus } from "@prisma/client";


export const processReturn = async (bookingId: number, adminNote: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId }
  });

  if (!booking) throw new Error("Booking tidak ditemukan");
  if (booking.status !== BookingStatus.RENTED) {
    throw new Error("Hanya barang dengan status RENTED yang bisa dikembalikan");
  }

  const now = new Date();
  let penalty = 0;

  // Hitung Denda (Rp 5.000 per jam jika lewat dari endDate)
  if (now > booking.endDate) {
    const diffInMs = now.getTime() - booking.endDate.getTime();
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));
    penalty = diffInHours * 5000;
  }

  // Langsung update di tabel yang sama
  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.COMPLETED,
      actualReturnDate: now,
      penaltyAmount: penalty,
      adminNote: adminNote || "Barang kembali lengkap"
    }
  });
};

export const getDashboardStats = async () => {
  // 1. Hitung total pendapatan (Gunakan Enum agar tidak error)
  const incomeStats = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
      penaltyAmount: true
    },
    where: {
      status: BookingStatus.COMPLETED
    }
  });

  // 2. Hitung jumlah status-status krusial (Gunakan Enum)
  const totalRented = await prisma.booking.count({
    where: { status: BookingStatus.RENTED }
  });

  const waitingConfirmation = await prisma.booking.count({
    where: { status: BookingStatus.WAITING_CONFIRMATION }
  });

  // 3. Ambil 5 Transaksi Terbaru
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true } }
    }
  });

  // 4. Barang paling laku - Kita ambil detail namanya juga biar Frontend gampang
  const topItemsRaw = await prisma.bookingItem.groupBy({
    by: ['itemId'],
    _count: { itemId: true },
    orderBy: { _count: { itemId: 'desc' } },
    take: 3
  });

  // Ambil nama barangnya berdasarkan ID yang didapat dari groupBy
  const topItems = await Promise.all(
    topItemsRaw.map(async (item) => {
      const itemDetail = await prisma.item.findUnique({
        where: { id: item.itemId },
        select: { name: true }
      });
      return {
        name: itemDetail?.name,
        count: item._count.itemId
      };
    })
  );

  return {
    summary: {
      totalRevenue: (incomeStats._sum.totalPrice || 0) + (incomeStats._sum.penaltyAmount || 0),
      activeRentals: totalRented,
      pendingOrders: waitingConfirmation,
    },
    recentBookings,
    topItems // Sekarang isinya sudah ada Nama Barang, bukan cuma ID
  };
};

export const getAllBookings = async (params: { 
  page: number; 
  limit: number; 
  status?: string; 
  search?: string 
}) => {
  const { page, limit, status, search } = params;
  const skip = (page - 1) * limit;

  // Bangun whereClause dengan hati-hati
  const whereClause: any = {};

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause.OR = [
      {
        bookingCode: {
          contains: search,
          // HAPUS mode: "insensitive" di sini
        },
      },
      {
        user: {
          name: {
            contains: search,
            // HAPUS mode: "insensitive" di sini
          },
        },
      },
    ];
  }

  const data = await prisma.booking.findMany({
    where: whereClause,
    include: {
      user: {
        select: { name: true, email: true },
      },
      payment: true,
    },
    take: limit,
    skip: skip,
    orderBy: { createdAt: "desc" },
  });

  // Hitung total untuk meta
  const total = await prisma.booking.count({ where: whereClause });

  return {
    bookings: data,
    meta: {
      totalData: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    },
  };
};

export const getReportData = async (filters: { 
  from?: string; 
  to?: string; 
  status?: string 
}) => {
  const { from, to, status } = filters;

  // Logic filter tanggal
  const dateFilter = from && to ? {
    createdAt: {
      gte: new Date(from), // Greater than or equal
      lte: new Date(to),   // Less than or equal
    }
  } : {};

  // Ambil data booking yang sudah selesai atau batal
  const bookings = await prisma.booking.findMany({
    where: {
      ...dateFilter,
      status: status ? (status as any) : { in: ['COMPLETED', 'CANCELLED'] },
    },
    include: {
      user: { select: { name: true } },
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Hitung Ringkasan Laporan (Summary)
  const summary = await prisma.booking.aggregate({
    where: {
      ...dateFilter,
      status: 'COMPLETED'
    },
    _sum: {
      totalPrice: true,
      penaltyAmount: true
    },
    _count: {
      id: true
    }
  });

  return {
    summary: {
      totalOrders: summary._count.id,
      totalRentalIncome: summary._sum.totalPrice || 0,
      totalPenaltyIncome: summary._sum.penaltyAmount || 0,
      grandTotal: (summary._sum.totalPrice || 0) + (summary._sum.penaltyAmount || 0)
    },
    bookings
  };
};

export const getRevenueData = async (from?: string, to?: string) => {
  const dateFilter = from && to ? {
    createdAt: {
      gte: new Date(from),
      lte: new Date(to),
    }
  } : {};

  return await prisma.booking.findMany({
    where: {
      ...dateFilter,
      status: BookingStatus.COMPLETED,
    },
    include: {
      user: { select: { name: true } },
      payment: true,
    },
    orderBy: { createdAt: "asc" },
  });
};