import { error } from "node:console"
import prisma from "../config/prisma"
import { BookingStatus } from "@prisma/client"

export const getAllItems = async () => {

  return await prisma.item.findMany({
    where: {
      isDeleted: false,
    }
  })

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

export const getItemsAvailability = async (data: {
  startDate: string;
  endDate: string;
}) => {

  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  // 1. Ambil semua item
  const items = await prisma.item.findMany();

  // 2. Loop semua item
  const result = await Promise.all(

    items.map(async (item) => {

      // 3. Hitung booking yang overlap
      const overlapping =
        await prisma.bookingItem.aggregate({

          _sum: {
            quantity: true
          },

          where: {

            itemId: item.id,

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

      // 4. Hitung stok
      const booked =
        overlapping._sum.quantity || 0;

      const available =
        item.stock - booked;

      // 5. Tentukan status
      let status: "FULL" | "LIMITED" | "AVAILABLE";

      if (available <= 0) {
        status = "FULL";
      } else if (available <= 2) {
        status = "LIMITED";
      } else {
        status = "AVAILABLE";
      }

      return {
        id: item.id,
        name: item.name,
        stock: item.stock,
        booked,
        available,
        status
      };

    })

  );

  return result;
};