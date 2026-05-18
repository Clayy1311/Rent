import prisma from "../config/prisma";
import { BookingStatus } from "@prisma/client";
import { Booking } from "@prisma/client";
import { error } from "node:console";
import { snap  } from "../config/midtrans";
// Fungsi untuk mengambil semua paket dengan perhitungan harga coret
export const getAllPackages = async () => {
  const packages = await prisma.package.findMany({
    include: {
      package_items: {
        include: { item: true }
      }
    }
  });

  return packages.map((pkg) => {
    // Hitung total harga item jika beli satuan
    const originalPrice = pkg.package_items.reduce((total, pi) => {
      return total + (pi.item.price * pi.quantity);
    }, 0);

    return {
      ...pkg,
      original_price: originalPrice,
      final_price: originalPrice - pkg.discount_price,
      total_savings: pkg.discount_price
    };
  });
};

// Fungsi untuk proses booking paket (Logika Stok & Transaction)
export const createPackageBooking = async (
  userId: number,
  data: {
    packageId: number;
    startDate: string;
    endDate: string;
  }
) => {

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  const diffInTime =
    end.getTime() - start.getTime();

  const diffInDays =
    Math.ceil(
      diffInTime / (1000 * 60 * 60 * 24)
    );

  const duration =
    diffInDays <= 0 ? 1 : diffInDays;

  const pkg =
    await prisma.package.findUnique({
      where: {
        id: data.packageId
      },

      include: {
        package_items: {
          include: {
            item: true
          }
        }
      }
    });

  if (!pkg) {
    throw new Error("Paket tidak ditemukan");
  }

  const originalPricePerDay =
    pkg.package_items.reduce((total, pi) => {
      return total + (
        pi.item.price * pi.quantity
      );
    }, 0);

  const packagePricePerDay =
    originalPricePerDay -
    pkg.discount_price;

  const totalPrice =
    packagePricePerDay * duration;

  for (const pi of pkg.package_items) {

    const overlapping =
      await prisma.bookingItem.aggregate({

        _sum: {
          quantity: true
        },

        where: {
          itemId: pi.item_id,

          booking: {
            status: {
              in: [
                BookingStatus.PENDING_PAYMENT,
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

    const bookedQty =
      overlapping._sum.quantity || 0;

    const availableStock =
      pi.item.stock - bookedQty;

    if (pi.quantity > availableStock) {
      throw new Error(
        `Stok tidak cukup untuk barang: ${pi.item.name}`
      );
    }
  }

  const bookingCode =
    `PKG-${Date.now()}-${userId}`;

  const newBooking =
    await prisma.$transaction(async (tx) => {

      const booking =
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
                Date.now() +
                24 * 60 * 60 * 1000
              )
          }
        });

      await Promise.all(

        pkg.package_items.map((pi) =>

          tx.bookingItem.create({

            data: {
              bookingId: booking.id,
              itemId: pi.item_id,
              packageId: pkg.id,
              quantity: pi.quantity,
              price: pi.item.price
            }

          })

        )

      );

      return booking;
    });

  const transaction =
    await snap.createTransaction({

      transaction_details: {
        order_id: newBooking.bookingCode!,
        gross_amount: newBooking.totalPrice
      },

      callbacks: {
        finish:
          "http://localhost:3000/history"
      }

    });

  return {
    booking: newBooking,
    token: transaction.token
  };
};

export const createPackage = async (data: {
    package_name: string;
    description?: string;
    min_capacity: number;
    max_capacity: number;
    discount_price: number;
    items: { itemId: number; quantity: number }[];
  }) => {
    return await prisma.$transaction(async (tx) => {
      // 1. Simpan Header Package
      const newPackage = await tx.package.create({
        data: {
          package_name: data.package_name,
          description: data.description,
          min_capacity: data.min_capacity,
          max_capacity: data.max_capacity,
          discount_price: data.discount_price,
        },
      });
  
      // 2. Simpan Semua Item ke PackageItem
      const packageItemsData = data.items.map((item) => ({
        package_id: newPackage.id,
        item_id: item.itemId,
        quantity: item.quantity,
      }));
  
      await tx.packageItem.createMany({
        data: packageItemsData,
      });
  
      return await tx.package.findUnique({
        where: { id: newPackage.id },
        include: { package_items: true },
      });
    });
  };


  export const getPackageById = async (id: number) => {
    return await prisma.package.findUnique({
      where: { id },
      include: {
        package_items: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true, // Sertakan image jika ada di schema
                category: true
              }
            }
          }
        }
      }
    });
  };

  export const deletepackage = async(id: number) => {
    const activeBookings = await prisma.bookingItem.findFirst({
    where: {
      itemId: id,
      booking: {
        status: {in: ["CONFIRMED", "RENTED"]}
      }
    }
  })

  if(activeBookings){
    throw new error("tidak bisa menghapus package karena ada item yang masih di sewa")

  }
  return await prisma.package.delete({
    where: {id},
  })
  }
export const updatepackage = async (
  id: number,
  data: {
    package_name: string;
    description?: string;
    min_capacity: number;
    max_capacity: number;
    discount_price: number;
    items: { itemId: number; quantity: number }[];
  }
) => {
  return await prisma.package.update({
    where: { id },
    data: {
      package_name: data.package_name,
      description: data.description,
      min_capacity: Number(data.min_capacity),
      max_capacity: Number(data.max_capacity),
      discount_price: Number(data.discount_price),
      
      package_items: {
        // 1. Hapus semua item lama di paket ini
        deleteMany: {}, 
        // 2. Buat ulang dengan koneksi yang bener ke Item
        create: data.items.map((it) => ({
          quantity: Number(it.quantity),
          item: {
            connect: { id: Number(it.itemId) } // PAKAI CONNECT DISINI
          }
        })),
      },
    },
    include: {
      package_items: {
        include: {
          item: true // Biar balikan datanya lengkap sama info barangnya
        }
      },
    },
  });
};