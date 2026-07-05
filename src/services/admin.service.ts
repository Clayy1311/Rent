import prisma from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import { Booking } from "@prisma/client";
import { PaymentStatus } from "@prisma/client";
import { Item } from "@prisma/client";
import { User } from "@prisma/client";
import { addDays } from "date-fns";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { startOfDay } from "date-fns";
import { OfflineCustomer } from "@prisma/client";

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

export const createAdminBooking = async (
  adminId: number,
  data: {
    name: string;
    phoneNumber: string;
    startDate: string;
    endDate: string;
    paymentMethod: "CASH" | "TRANSFER" | "QRIS";
    discount?: number; // 💡 TAMBAHKAN KOLOM DISKON OPSIONAL DI SINI
    items: {
      itemId: number;
      quantity: number;
    }[];
  },
) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  // 🔥 HITUNG DURASI HARI
  const duration = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  let totalPrice = 0;

  const validatedItems: {
    itemId: number;
    quantity: number;
    price: number;
  }[] = [];

  // 🔥 VALIDASI ITEM + STOCK
  for (const cartItem of data.items) {
    const item = await prisma.item.findUnique({
      where: { id: cartItem.itemId },
    });

    if (!item) {
      throw new Error("Item tidak ditemukan");
    }

    const overlappingBookings = await prisma.bookingItem.aggregate({
      _sum: { quantity: true },
      where: {
        itemId: cartItem.itemId,
        booking: {
          status: {
            in: [
              BookingStatus.PENDING_PAYMENT,
              BookingStatus.WAITING_CONFIRMATION,
              BookingStatus.CONFIRMED,
              BookingStatus.RENTED,
            ],
          },
          AND: [
            { startDate: { lte: end } },
            {
              endDate: {
                gte: new Date(start.getTime() - 24 * 60 * 60 * 1000),
              },
            },
          ],
        },
      },
    });

    const bookedQuantity = overlappingBookings._sum.quantity || 0;
    const availableStock = item.stock - bookedQuantity;

    if (cartItem.quantity > availableStock) {
      throw new Error(
        `Stok ${item.name} tidak mencukupi. Tersedia: ${availableStock}`,
      );
    }

    // 🔥 HITUNG HARGA NORMAL SEBELUM DISKON
    totalPrice += item.price * cartItem.quantity * duration;

    validatedItems.push({
      itemId: item.id,
      quantity: cartItem.quantity,
      price: item.price,
    });
  }

  // 💡 POTONG DENGAN HARGA DISKON JIKA DIKIRIM DARI FRONTEND
  if (data.discount && data.discount > 0) {
    // Total diskon paket dikali durasi sewa hari
    const totalCut = data.discount * duration;
    // Pastikan totalPrice tidak bernilai minus
    totalPrice = Math.max(0, totalPrice - totalCut);
  }

  const bookingCode = `ADM-${Date.now()}-${adminId}`;

  const result = await prisma.$transaction(async (tx) => {
    // 1️⃣ CREATE BOOKING (Sudah menggunakan totalPrice setelah diskon)
    // 1️⃣ CREATE OFFLINE CUSTOMER
    const customer = await tx.offlineCustomer.create({
      data: {
        name: data.name,
        phoneNumber: data.phoneNumber,
      },
    });
    const newBooking = await tx.booking.create({
      data: {
        userId: adminId,
        bookingCode,
        startDate: start,
        endDate: end,
        totalPrice, //

        status: BookingStatus.RENTED,

        // Relasi ke customer offline
        offlineCustomerId: customer.id,
      },
    });

    // 2️⃣ CREATE ITEMS
    for (const item of validatedItems) {
      await tx.bookingItem.create({
        data: {
          bookingId: newBooking.id,
          itemId: item.itemId,
          quantity: item.quantity,
          price: item.price,
        },
      });
    }

    // 3️⃣ PAYMENT (Jumlah tagihan bayar jadi akurat ikut terpotong diskon)
    await tx.payment.create({
      data: {
        bookingId: newBooking.id,
        amount: totalPrice, // 🎯 Jumlah bayar lunas otomatis 179 Ribu
        paymentProof: data.paymentMethod,
        status: PaymentStatus.VERIFIED,
      },
    });

    return newBooking;
  });

  return {
    booking: result,
  };
};
export const processReturn = async (bookingId: number, adminNote: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) throw new Error("Booking tidak ditemukan");

  if (booking.status !== BookingStatus.RENTED) {
    throw new Error("Hanya barang dengan status RENTED yang bisa dikembalikan");
  }

  const price = booking.totalPrice;

  // =========================
  // NORMALIZE DATE (BUANG JAM + TIMEZONE ISSUE)
  // =========================
  const toDateOnly = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const endDate = toDateOnly(new Date(booking.endDate));
  const today = toDateOnly(new Date());

  // =========================
  // HITUNG SELISIH HARI
  // =========================
  const diffTime = today.getTime() - endDate.getTime();

  let lateDays = 0;
  let isLate = false;
  let penalty = 0;

  if (diffTime > 0) {
    lateDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    isLate = true;
    penalty = lateDays * price;
  }

  // =========================
  // UPDATE DATABASE
  // =========================
  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.FINISHED,
      actualReturnDate: new Date(),
      penaltyAmount: penalty,
      adminNote: adminNote || "Barang kembali lengkap",
    },
  });

  // =========================
  // RESPONSE KE FRONTEND
  // =========================
  return {
    ...updatedBooking,
    isLate,
    lateDays,
    penaltyAmount: penalty,
  };
};

export const getDashboardStats = async () => {
  // 1. Hitung total pendapatan (Gunakan Enum agar tidak error)
  const incomeStats = await prisma.booking.aggregate({
    _sum: {
      totalPrice: true,
      penaltyAmount: true,
    },
    where: {
      status: BookingStatus.FINISHED,
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

  const where: any = {};

  // Jika status ada isinya, dan nilainya BUKAN "ALL" maupun string kosong ""
if (status && status !== "ALL" && status.trim() !== "") {
  where.status = status;
} else {
  // Kondisi default/Semua Status: tampilkan yang FINISHED dan RENTED
  where.status = {
    in: ["FINISHED", "RENTED"],
  };
}

  // search bookingCode atau nama user
  if (search) {
    where.OR = [
      {
        bookingCode: {
          contains: search,
        },
      },
      {
        user: {
          name: {
            contains: search,
          },
        },
      },
      {
        offlineCustomer:{
          name: {
            contains: search,
          }
        }
      }
    ];
  }

  // ambil data
  const data = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      payment: true,
      items: {
        include: {
          item: true,
        },
      },
      offlineCustomer: {
        select: {
          name: true,
          phoneNumber: true,
        }
      }
    },
    take: limit,
    skip,
    orderBy: {
      createdAt: "desc",
    },
  });

  // total data sesuai filter
  const total = await prisma.booking.count({
    where,
  });

  // Petakan data untuk menambahkan totalBayar secara dinamis
  const formattedBookings = data.map((booking) => {
    const penalty = booking.penaltyAmount ?? 0;
    return {
      ...booking,
      totalBayar: booking.totalPrice + penalty,
    };
  });

  return {
    bookings: formattedBookings,
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
  let dateFilter = {};

  if (from && to) {
    // 🔥 paksa jadi awal hari
    const start = startOfDay(new Date(from));

    // 🔥 +1 hari biar full inclusive
    const end = startOfDay(addDays(new Date(to), 1));

    dateFilter = {
      createdAt: {
        gte: start,
        lt: end,
      },
    };
  }

  return prisma.booking.findMany({
    where: {
      status: "FINISHED",
      ...dateFilter,
    },
    include: {
      user: { select: { name: true } },
      payment: true,
    },
    orderBy: {
      createdAt: "asc",
    },
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
  const data = await prisma.booking.findMany({
    select: {
      status: true,
      createdAt: true,
      endDate: true,
    },where: {
      status: {
        in : ["FINISHED", "RENTED",]
      }
    },
  })

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
    RENTED: 0,
  };

  data.forEach((item) => {
    if (item.status === "FINISHED") {
      statusData.FINISHED++;
    } else if (item.status === "RENTED") {
      statusData.RENTED++;
    }
  });

  return [
    { status: "FINISHED", total: statusData.FINISHED },
    { status: "RENTED", total: statusData.RENTED },
  ];
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
    select: {
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  });
};

export const RevenueSummary = async () => {
  const now = new Date();

  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = addDays(new Date(now.getFullYear(), now.getMonth() + 1, 0), 1);

  const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastEnd = addDays(new Date(now.getFullYear(), now.getMonth(), 0), 1);

  // 🔥 1. AMBIL SEMUA DATA (UNTUK TOTAL REVENUE GLOBAL)
  const allData = await prisma.booking.findMany({
    where: {
      status: "FINISHED",
    },
    select: {
      id: true,
      createdAt: true,
      totalPrice: true,
      penaltyAmount: true,
    },
  });

  let totalRevenue = 0;
  let currentMonthTotal = 0;
  let lastMonthTotal = 0;
  let currentMonthCount = 0;

  const currentMonthBookings: any[] = [];

  allData.forEach((item) => {
    const date = new Date(item.createdAt);

    const total = (item.totalPrice || 0) + (item.penaltyAmount || 0);

    // 🔥 GLOBAL TOTAL (SEMUA DATA)
    totalRevenue += total;

    // 🔥 CURRENT MONTH
    if (date >= start && date < end) {
      currentMonthTotal += total;
      currentMonthCount++;

      currentMonthBookings.push({
        id: item.id,
        createdAt: item.createdAt,
        total,
      });
    }

    // 🔥 LAST MONTH
    if (date >= lastStart && date < start) {
      lastMonthTotal += total;
    }
  });

  let growth = 0;

  if (lastMonthTotal > 0) {
    growth = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
  } else {
    growth = currentMonthTotal > 0 ? 100 : 0;
  }

  return {
    totalRevenue, // 🔥 FIXED (SEMUA BULAN)
    currentMonthTotal,
    lastMonthTotal,
    currentMonthCount,
    growth: Number(growth.toFixed(1)),
  };
};
export const GetAllTransactionService = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const skip = (page - 1) * limit;

  const whereCondition: any = {
    status: "FINISHED",
  };

  if (search) {
    whereCondition.OR = [
      {
        bookingCode: {
          contains: search,
        },
      },
      {
        offlineCustomer: {
          name: {
            contains: search,
          }
        }
      },
      {
        user: {
          name: {
            contains: search,
          },
        },
      },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        bookingCode: true,
        startDate: true,
        endDate: true,
        totalPrice: true,
        penaltyAmount: true,
        user: {
          select: { name: true },
        },
        payment: {
          select: { paymentProof: true },
        },
        offlineCustomer: {
          select: {
            name: true,
          }
        }
      },
    }),

    prisma.booking.count({
      where: whereCondition,
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const ArchiveItemService = async(id: number) => {
  return await prisma.item.update({
    where: {id},
    data: {
      isDeleted: true,
    }
  })
}

export const UnarchiveItemService = async(id: number) => {
  return await prisma.item.update({
    where: {id},
    data: {
      isDeleted: false,
    }
  })
}

export const ArchivePackageService = async(id: number) => {
  return await prisma.package.update({
    where: {id},
    data:{
      isDeleted: true,
    }
  })
}
export const UnarchivePakcageService= async(id:number) => {
  return await prisma.package.update({
    where: {id},
    data: {
      isDeleted: false,
    }
  })
}

export const ArchiveCategoryService = async(id: number)=>{
  return await prisma.category.update({
    where: {id},
    data: {
      isDeleted: true,
    }
  })
}

export const UnarchiveCategoryService = async(id: number) => {
  return await prisma.category.update({
    where: {id},
    data: {
      isDeleted: false,
    }
  })
}

export const GetAllArchiveItemService = async() => {
  return await prisma.item.findMany({
    where: {
      isDeleted: true,
    }
  })
}
export const GetAllArchiveCategoryService = async() => {
  return await prisma.category.findMany({
    where: {
      isDeleted: true,
    }
  })
}
export const GetAllArchivePackageService = async() => {
  return await prisma.package.findMany({
    where: {
      isDeleted: true,
    },
    include: {
      package_items: true,
    }
  })
}