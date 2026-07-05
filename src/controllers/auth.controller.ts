import { Request, Response } from "express";
import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import * as authService from "../services/auth.service";
import { generateToken } from "../utils/jwt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";

// export const register = async (req: Request, res: Response) => {
//   try {
//     const { name, email, phone, address, password } = req.body

//     const existingUser = await prisma.user.findUnique({
//       where: { email }
//     })

//     if (existingUser) {
//       return res.status(400).json({
//         message: "Email already registered"
//       })
//     }

//     const hashedPassword = await bcrypt.hash(password, 10)

//     // 1. buat user dulu (belum verified)
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         phone,
//         address,
//         password: hashedPassword,
//         isVerified: false
//       }
//     })

//     // 2. bikin token verifikasi
//     const token = crypto.randomUUID()

//     await prisma.emailVerification.create({
//       data: {
//         userId: user.id,
//         token,
//         expiresAt: new Date(Date.now() + 1000 * 60 * 60) // 1 jam
//       }
//     })

//     // 3. kirim email (pakai nodemailer)
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//       }
//     })

//     const verifyLink = `http://localhost:3000/verify-email?token=${token}`

//     await transporter.sendMail({
//       from: "no-reply@yourapp.com",
//       to: email,
//       subject: "Verify your email",
//       html: `
//         <h2>Verify Your Account</h2>
//         <p>Klik link di bawah untuk verifikasi akun:</p>
//         <a href="${verifyLink}">Verify Email</a>
//       `
//     })

//     return res.status(201).json({
//       message: "Register success. Please check your email to verify account."
//     })

//   } catch (error) {
//     console.error("REGISTER ERROR:", error)
//     return res.status(500).json({
//       message: "Internal server error",
//       error
//     })
//   }
// }

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, password } = req.body;

    // cek user
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        address,
        password: hashedPassword,
        isVerified: false,
      },
    });

    // generate token
    const token = crypto.randomUUID();

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    // kirim email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyLink = `http://localhost:3001/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: "no-reply@azkaoutdoor.com",
      to: email,
      subject: "Verify Your Account",
      html: `
  <h2>Verify Your Account</h2>
  <p>Klik link di bawah untuk verifikasi akun:</p>
  
  <a href="${verifyLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:white;text-decoration:none;border-radius:5px;">
    Verify Email
  </a>

  <p>Atau copy link ini:</p>
  <p>${verifyLink}</p>
`,
    });

    return res.status(201).json({
      message: "Register success. Please check your email to verify account",
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({
      message: "Internal server error",
      error,
    });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const record = await prisma.emailVerification.findUnique({
      where: { token: String(token) },
    });

      if (!record) {
      return res.redirect(
        "http://localhost:3000/verify-email?status=failed"
      );
    }
     if (record.expiresAt < new Date()) {
      return res.redirect(
        "http://localhost:3000/verify-email?status=failed"
      );
    }if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "Token expired" });
    }
    await prisma.user.update({
      where: { id: record.userId },
      data: { isVerified: true },
    });
    await prisma.emailVerification.delete({
      where: { token: String(token) },
    });
 res.redirect(
  "http://localhost:3000/verify-email?status=success"
);
  } catch (error) {
    console.error(error);
   res.redirect(
  "http://localhost:3000/verify-email?status=failed"
);
  }
};

export const login = async (req: Request, res: Response) => { 
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }
     if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first"
      })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Wrong password",
      });
    }

    const token = generateToken(user.id, user.role);

    res.json({
      message: "Login success",
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userSession = (req as any).user;

    if (!userSession || !userSession.id) {
      return res.status(401).json({ 
        status: "error", 
        message: "Unauthorized: Session tidak ditemukan" 
      });
    }

    const userId = Number(userSession.id);

    if (isNaN(userId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid User ID"
      });
    }

    const user = await authService.getUserProfile(userId);

    if (!user) {
      return res
        .status(404)
        .json({ status: "error", message: "User tidak ditemukan" });
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

export const googleLogin = (req: Request, res: Response) => {
  const url = client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    prompt: "select_account"
  });

  res.redirect(url);
};
export const googleCallback = async (req: Request, res: Response) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect("http://localhost:3000/login-failed?reason=no_code");
    }

    // 1. WAJIB sertakan redirect_uri di dalam object parameter getToken
    const { tokens } = await client.getToken({
      code: code as string,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL, // Harus sama persis dengan .env
    });
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(400).json({ message: "Invalid Google token" });
    }

    const { email, name } = payload;

    // Cek user di database
    let user = await prisma.user.findUnique({
      where: { email: email! },
    });

    // Kalau belum ada → create
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email!,
          name: name || "Google User",
          password: "", 
          isVerified: true,
          // ⚠️ CATATAN: Jika kolom phone/address di schema.prisma kamu itu wajib (required),
          // pastikan beri nilai default string kosong "" agar database tidak error:
          phone: "",   
          address: "", 
        },
      });
    }

    // Generate JWT aplikasi kamu
    const token = generateToken(user.id, user.role);

    // Redirect ke frontend sukses sambil membawa token
   return res.redirect(
  `http://localhost:3000/login-success?token=${token}&role=${user.role}&name=${encodeURIComponent(user.name)}&id=${user.id}`
);
  } catch (error) {
    // Ini akan memunculkan detail error asli di terminal backend kamu untuk debugging
    console.error("Detail Error Callback Google:", error);
    return res.redirect("http://localhost:3000/login-failed");
  }
};