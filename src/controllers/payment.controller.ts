import { Request, Response } from "express"
import * as paymentService from "../services/payment.service"

export const uploadPayment = async (
  req: Request,
  res: Response
) => {

  try {

    const bookingId = Number(req.params.bookingId)

    const filePath = req.file?.path

    if (!filePath) {
      return res.status(400).json({
        message: "Payment proof required"
      })
    }

    const payment =
      await paymentService.uploadPayment(
        bookingId,
        filePath
      )

    res.json({
      message: "Payment uploaded",
      data: payment
    })

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    })

  }

}

export const verifyPayment = async (
    req: Request,
    res: Response
  ) => {
  
    try {
  
      const bookingId = Number(req.params.bookingId)
  
      const booking =
        await paymentService.verifyPayment(bookingId)
  
      res.json({
        message: "Payment verified",
        data: booking
      })
  
    } catch (error: any) {
  
      res.status(400).json({
        message: error.message
      })
  
    }
  
  }