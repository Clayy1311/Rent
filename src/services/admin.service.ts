import prisma from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import { Booking } from "@prisma/client";
import { Item } from "@prisma/client";
import { User } from "@prisma/client";

// SERVICE PICKUP: Mengubah status dari CONFIRMED ke RENTED
export const confirmPickUp = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");

  // Validasi: Hanya bisa pickup jika sudah dibayar/dikonfirmasi admin
  if (booking.status !== BookingStatus.CONFIRMED) {
    throw new Error("Barang belum bisa diambil karena status belum CONFIRMED");
  }

  return await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.RENTED,
      // Kamu bisa mencatat waktu pengambilan asli jika ada fieldnya
      // actualPickUpDate: new Date()
    },
  });
};

// SERVICE RETURN: Menghitung denda otomatis dan menyelesaikan transaksi
export const processReturn = async (bookingId: number, adminNote: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");

  // Pastikan status dicek dengan benar
  if (booking.status !== BookingStatus.RENTED) {
    throw new Error("Hanya barang dengan status RENTED yang bisa dikembalikan");
  }

  const price = booking.totalPrice;

  const now = new Date();

  // --- LOGIKA BATAS AKHIR HARI ---
  // Kita paksa jam di endDate jadi 23:59:59 hari itu.
  const deadline = new Date(booking.endDate);
  deadline.setHours(23, 59, 59, 999);

  let penalty = 0;

  // Sekarang denda cuma dihitung kalau 'now' sudah lewat dari jam 23:59 malam
  if (now.getTime() > deadline.getTime()) {
    const diffInMs = now.getTime() - deadline.getTime();
     

    const pen = Math.ceil(diffInMs/ (1000 *60 *60 * 24));
    penalty = pen * price;

    // // Hitung denda per jam (dihitung mulai dari lewat tengah malam)
    // const diffInHours = Math.ceil(diffInMs / (1000 *  60 * 60));
    // penalty = diffInHours * 5000;
  }

  // Update dan kembalikan hasil terbarunya
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.FINISHED, // Pastikan ini sesuai enum di Prisma lu
      actualReturnDate: now,
      penaltyAmount: penalty,
      adminNote: adminNote || "Barang kembali lengkap",
    },
  });

  return updatedBooking;
};

export const getDashboardStats = async () => {
  // 1. Hitung total pendapatan (Gunakan Enum agar tidak error)
  const incomeStats = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
      penaltyAmount: true,
    },
    where: {
      status: BookingStatus.COMPLETED,
    },
  });

  // 2. Hitung jumlah status-status krusial (Gunakan Enum)
  const totalRented = await prisma.booking.count({
    where: { status: BookingStatus.RENTED },
  });

  const waitingConfirmation = await prisma.booking.count({
    where: { status: BookingStatus.WAITING_CONFIRMATION },
  });

  // 3. Ambil 5 Transaksi Terbaru
  const recentBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
    },
  });

  // 4. Barang paling laku - Kita ambil detail namanya juga biar Frontend gampang
  const topItemsRaw = await prisma.bookingItem.groupBy({
    by: ["itemId"],
    _count: { itemId: true },
    orderBy: { _count: { itemId: "desc" } },
    take: 3,
  });

  // Ambil nama barangnya berdasarkan ID yang didapat dari groupBy
  const topItems = await Promise.all(
    topItemsRaw.map(async (item) => {
      const itemDetail = await prisma.item.findUnique({
        where: { id: item.itemId },
        select: { name: true },
      });
      return {
        name: itemDetail?.name,
        count: item._count.itemId,
      };
    }),
  );

  return {
    summary: {
      totalRevenue:
        (incomeStats._sum.totalPrice || 0) +
        (incomeStats._sum.penaltyAmount || 0),
      activeRentals: totalRented,
      pendingOrders: waitingConfirmation,
    },
    recentBookings,
    topItems, // Sekarang isinya sudah ada Nama Barang, bukan cuma ID
  };
};

export const getAllBookings = async (params: {
  page: number;
  limit: number;
  status?: string;
  search?: string;
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
      items: {
        include: {
          item: true,
        }
      }
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
  status?: string;
}) => {
  const { from, to, status } = filters;

  // Logic filter tanggal
  const dateFilter =
    from && to
      ? {
          createdAt: {
            gte: new Date(from), // Greater than or equal
            lte: new Date(to), // Less than or equal
          },
        }
      : {};

  // Ambil data booking yang sudah selesai atau batal
  const bookings = await prisma.booking.findMany({
    where: {
      ...dateFilter,
      status: status ? (status as any) : { in: ["COMPLETED", "CANCELLED"] },
    },
    include: {
      user: { select: { name: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  // Hitung Ringkasan Laporan (Summary)
  const summary = await prisma.booking.aggregate({
    where: {
      ...dateFilter,
      status: "COMPLETED",
    },
    _sum: {
      totalPrice: true,
      penaltyAmount: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    summary: {
      totalOrders: summary._count.id,
      totalRentalIncome: summary._sum.totalPrice || 0,
      totalPenaltyIncome: summary._sum.penaltyAmount || 0,
      grandTotal:
        (summary._sum.totalPrice || 0) + (summary._sum.penaltyAmount || 0),
    },
    bookings,
  };
};

export const getRevenueData = async (from?: string, to?: string) => {
  const dateFilter =
    from && to
      ? {
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        }
      : {};

  return await prisma.booking.findMany({
    where: {
      ...dateFilter,
      status: BookingStatus.FINISHED,
    },
    include: {
      user: { select: { name: true } },
      payment: true,
    },
    orderBy: { createdAt: "asc" },
  });
};

export const getBookingDetail = async (id: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          item: true, // Supaya admin tahu barang apa saja yang dipesan
        },
      },
      payment: true, // WAJIB: Supaya admin bisa lihat bukti transfer
    },
  });

  if (!booking) throw new Error("Data pesanan tidak ditemukan");

  return booking;
};

export const getMonthlyRevenueService = async () => { 
  // Ambil data booking yang statusnya FINISHED
  const dataMonthly = await prisma.booking.findMany({
    where: {
      status: "FINISHED",
    },
    select: {
      totalPrice: true,
      penaltyAmount: true,
      createdAt: true,
    },
  });

  const monthlyData = {};
  
  dataMonthly.forEach((item) => {
    const date = new Date(item.createdAt);
    
    // PERBAIKAN: Gunakan format 'id-ID' agar singkatan bulan seragam "Apr", "Mei", dll.
    const month = date.toLocaleDateString("id-ID", { month: "short" });

    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    // FIX OPERATOR JAVASCRIPT: Kurung pembungkus wajib terpisah agar denda ikut dijumlahkan!
    const totalPerItem = (item.totalPrice || 0) + (item.penaltyAmount || 0);
    
    monthlyData[month] += totalPerItem;
  });

  // Ubah menjadi array untuk front-end
  const result = Object.keys(monthlyData).map((month) => ({
    month,
    total: monthlyData[month],
  }));

  return result;
};

export const getRentService = async () => {
  //ambil data sewa
  const data = await prisma.booking.findMany();

  const monthlyData = {};

  data.forEach((item) => {
    const date = new Date(item.createdAt);
    const month = date.toLocaleDateString("default", { month: "short" });
    if (!monthlyData[month]) {
      monthlyData[month] = 0;
    }

    monthlyData[month] += 1;
  });

  const result = Object.keys(monthlyData).map((month) => ({
    month,
    total: monthlyData[month],
  }));

  return result;
};

export const getStatusService = async () => {
  const data = await prisma.booking.findMany({
    select: {
      status: true,
    },
  });

  const statusData = {
    FINISHED: 0,
    EXPIRED: 0,
    CONFIRMED: 0,
    RENTED: 0,
  };

  //LOOP
  data.forEach((item) => {
    if (item.status === "FINISHED") {
      statusData.FINISHED += 1;
    } else if (item.status === "EXPIRED") {
      statusData.EXPIRED += 1;
    } else if (item.status === "CONFIRMED") {
      statusData.CONFIRMED += 1;
    } else if (item.status === "RENTED") {
      statusData.RENTED += 1;
    }
  });

  const result = [
    { status: "FINISHED", total: statusData.FINISHED },
    { status: "EXPIRED", total: statusData.EXPIRED },
    { status: "CONFIRMED", total: statusData.CONFIRMED },
    { status: "RENTED", total: statusData.RENTED },
  ];
  return result;
};

export const getItemBestSelling = async () => {
  //ambil db nama dan stok barangnya
  const data = await prisma.bookingItem.findMany({
    select: {
      quantity: true,
      item: {
        select: {
          name: true,
        },
      },
    },
  });

  //siapkan wadah
  const dataItem = {};

  //loop db
  data.forEach((item) => {
    const name = item.item.name;
    const quantity = item.quantity;

    //cek apa name sudah ada
    if (!dataItem[name]) {
      dataItem[name] = 0;
    }
    //jika tidak
    dataItem[name] += quantity;
  });

  //ubah ke array dan urutkan terbesar
  const result = Object.keys(dataItem)
    .map((name) => ({
      name,
      total: dataItem[name],
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
  return result;
};

export const getAllUsers = async () => {
  return await prisma.user.findMany({
    where: {
      role: "USER",
    },
    select:{
      name: true,
      email: true,
      phone: true,
      address: true
    }
  });
};

export const RevenueSummary = async () => {
  // Ambil tanggal sekarang
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Tentukan last month
  const lastMonthDate = new Date(currentYear, currentMonth - 1);
  const lastMonth = lastMonthDate.getMonth();
  const lastMonthYear = lastMonthDate.getFullYear();

  const dataprice = await prisma.booking.findMany({
    where: {
      status: "FINISHED",
    },
    select: {
      totalPrice: true,
      createdAt: true,
      penaltyAmount: true,
    },
  });

  let currentMonthTotal = 0;
  let totalRevenue = 0;
  let lastMonthTotal = 0;

  dataprice.forEach((item) => {
    const date = new Date(item.createdAt);
    const month = date.getMonth();
    const year = date.getFullYear();

    // Sembuhkan total per-item (Harga sewa + Denda) menggunakan || 0
    const totalItem = (item.totalPrice || 0) + (item.penaltyAmount || 0);

    // Accumulate total keseluruhan
    totalRevenue += totalItem;

    // Hitung Pendapatan Bulan Ini (Current Month)
    if (month === currentMonth && year === currentYear) {
      currentMonthTotal += totalItem;
    }

    // Hitung Pendapatan Bulan Lalu (Last Month)
    // FIX BUG: Sekarang bulan lalu juga dihitung adil beserta dendanya!
    if (month === lastMonth && year === lastMonthYear) {
      lastMonthTotal += totalItem;
    }
  });

  // Hitung persentase pertumbuhan (Growth)
  let growth = 0;
  if (lastMonthTotal > 0) {
    growth = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  } else if (lastMonthTotal === 0 && currentMonthTotal > 0) {
    // Pengaman: Jika bulan lalu belum ada pemasukan (0) tapi bulan ini ada omzet, growth = 100%
    growth = 100;
  }

  return {
    currentMonthTotal,
    totalRevenue,
    lastMonthTotal,
    growth: Number(growth.toFixed(1)),
  };
};