import { error } from "node:console"
import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"

export const getAllItems = async () => {

  return await prisma.item.findMany()

}

export const getItemById = async (id: number) => {

  return await prisma.item.findUnique({
    where: { id }
  })

}

export const createItem = async (data: {
  name: string;
  description?: string;
  price: number;
  stock: number;
  image?: string; // Tambahkan ini
  categoryId: number; // Tambahkan ini agar relasi terbentuk
}) => {
  return await prisma.item.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      image: data.image,
      categoryId: data.categoryId,
    },
  });
};

export const updateItem = async (
  id: number,
  data: {
    name?: string
    description?: string
    price?: number
    stock?: number
    image?: string
  }
) => {

  return await prisma.item.update({
    where: { id },
    data
  })

}

export const deleteItem = async (id: number) => {

  const activeBookings = await prisma.bookingItem.findFirst({
    where: {
      itemId: id,
      booking: {
        status: {in: ["CONFIRMED", "RENTED"]}
      }
    }
  })
  if (activeBookings){
    throw new error("Barang tidak bisa dihapus karena sedang dalam proses penyewaan aktif");
  }
  return await prisma.item.delete({
    where: {id},
  })

}

export const getAvailableItemsService = async (params: {
  startDate: string;
  endDate: string;
  categoryId?: number;
}) => {
  const { startDate, endDate, categoryId } = params;

  // Konversi input ke objek Date untuk perbandingan Prisma
  const start = new Date(startDate);
  const end = new Date(endDate);

  const items = await prisma.item.findMany({
    where: {
      // Filter kategori jika user memilih kategori tertentu
      ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    },
    include: {
      category: true,
      // Ambil data transaksi yang statusnya aktif & tanggalnya tabrakan
      bookingItems: {
        where: {
          booking: {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.RENTED,
                BookingStatus.PENDING_PAYMENT,
                BookingStatus.WAITING_CONFIRMATION,
              ],
            },
            // Logika Overlap: Mengecek apakah jadwal sewa di DB bertabrakan dengan input user
            AND: [
              { startDate: { lt: end } }, // Sewa di DB dimulai sebelum sewa baru berakhir
              { endDate: { gt: start } }, // Sewa di DB berakhir setelah sewa baru dimulai
            ],
          },
        },
      },
    },
  });

  // Kalkulasi stok per item
  const availableItems = items.map((item) => {
    // Hitung total unit yang sudah "dipesan" (occupied) di range tanggal tersebut
    const occupiedQty = item.bookingItems.reduce(
      (acc, curr) => acc + curr.quantity,
      0
    );

    // Sisa stok = Stok total di database - jumlah yang sudah terpakai
    const currentStock = item.stock - occupiedQty;

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      totalStock: item.stock, // Stok asli di gudang
      availableStock: Math.max(0, currentStock), // Jika hasil negatif, paksa ke 0
      category: item.category?.name,
    };
  });

  // Return semua item (termasuk yang stoknya 0 agar frontend bisa nampilin status "Habis")
  return availableItems;
};