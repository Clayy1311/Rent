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
  }
) => {

  return await prisma.item.update({
    where: { id },
    data
  })

}

export const deleteItem = async (id: number) => {

  return await prisma.item.delete({
    where: { id }
  })

}

export const getAvailableItemsService = async (params: {
  startDate: string;
  endDate: string;
  categoryId?: number;
}) => {
  const { startDate, endDate, categoryId } = params;

  const items = await prisma.item.findMany({
    where: categoryId ? { categoryId: Number(categoryId) } : {},
    include: {
      category: true,
      // Ambil bookingItems yang tanggal sewanya bertabrakan dengan input user
      bookingItems: {
        where: {
          booking: {
            // Kita hitung semua yang sudah dikonfirmasi, sedang disewa, atau selesai
            // Kecuali yang CANCELLED atau WAITING_CONFIRMATION (opsional)
            status: { 
              in: [BookingStatus.CONFIRMED, BookingStatus.RENTED] 
            },
            // Logika Tabrakan Tanggal (Overlap)
            AND: [
              { startDate: { lt: new Date(endDate) } },
              { endDate: { gt: new Date(startDate) } }
            ]
          }
        }
      }
    }
  });

  // Kalkulasi stok real-time
  const availableItems = items.map(item => {
    // Hitung total quantity yang sudah terpakai
    const rentedQty = item.bookingItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const currentStock = item.stock - rentedQty;

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: item.stock, // Stok total di gudang
      availableStock: currentStock > 0 ? currentStock : 0, // Sisa stok siap sewa
      category: item.category?.name
    };
  });

  // Kamu bisa memilih: mau kirim semua atau yang tersedia saja?
  // Biasanya kirim semua tapi yang stok 0 diberi keterangan "Habis" di Frontend
  return availableItems;
};