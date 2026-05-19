import { Request, Response } from "express"
import prisma from "../config/prisma"
import bcrypt from "bcrypt" 
import * as authService from "../services/auth.service"
import { generateToken } from "../utils/jwt"

export const register = async (req: Request, res: Response) => {
    try {
      const { name, email,phone,address, password } = req.body
  
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
  
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered"
        }) 
      }
  
      const hashedPassword = await bcrypt.hash(password, 10)
  
      const user = await prisma.user.create({
        data: {
          name,
          email,
          phone,
          address,
          password: hashedPassword
        }
      })
  
      res.status(201).json({
        message: "Register success",
        user
      })
  
    } catch (error) {
      console.error("REGISTER ERROR:", error)
      res.status(500).json({
        message: "Internal server error",
        error
      })
    }
  }


export const login = async (req: Request, res: Response) => {

  try {

    const { email, password } = req.body

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password"
      })
    }

    const token = generateToken(user.id, user.role)

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    res.status(500).json(error)
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    // Ambil id dari req.user (hasil dekorasi middleware verifyToken)
    const userId = (req as any).user.id;

    const user = await authService.getUserProfile(userId);

    if (!user) {
      return res.status(404).json({ status: "error", message: "User tidak ditemukan" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};