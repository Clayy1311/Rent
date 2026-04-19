import prisma from "../config/prisma"

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