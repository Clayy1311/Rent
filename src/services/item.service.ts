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
  name: string
  description?: string
  price: number
  stock: number
}) => {

  return await prisma.item.create({
    data
  })

}

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