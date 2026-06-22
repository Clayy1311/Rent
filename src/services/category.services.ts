import prisma from "../config/prisma";



export const getAllCategory = async() => {
    return await prisma.category.findMany({
        include: {
            items: true
        },
        where: {
            isDeleted: false,
        }
    })
}
export const DeleteCategory = async(id: number) => {
    return await prisma.category.delete({
        where: {
            id: id
        }
    })
}

export const CreateCategory = async(name: string) => {


    const existingCategory = await prisma.category.findFirst({
        where: {
            name: {
                equals: name
            }
        }
    })

    if (existingCategory) {
        throw new Error("kategory sudah ada")
    }
    return await prisma.category.create({
        data: {
            name
        }
    })
}

export const UpdateCategoryService = async(id: number, name: string) => {
    return await prisma.category.update({
        where: {id},
        data: {
            name: name
        }
    })
}