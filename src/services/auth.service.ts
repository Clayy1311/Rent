import prisma from "../config/prisma";

export const getUserProfile = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      
    },
  });
};