import { Request, Response } from "express"
import * as bookingService from "../services/booking.service"
import { AuthRequest } from "../middleware/auth.middleware"

export const createBooking = async (
  req: AuthRequest,
  res: Response
) => {

  try {

    const userId = req.user.id
    console.log(req.user)

    const booking = await bookingService.createBooking({
      userId,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      items: req.body.items
    })

    res.json({
      message: "Booking created",
      data: booking
    })

  } catch (error: any) {

    res.status(400).json({
      message: error.message
    })

  }

}

export const mybookings = async(req: AuthRequest, res: Response) => {

  try {

    const userId = (req as any).user.id

    const bookings = await bookingService.mybookings(userId)

    res.json({
      message: "success",
      data: bookings
    })

  } catch (error) {

    res.status(500).json({
      message: "error get bookings"
    })

  }

}
