import { Request, Response } from "express";
import ExcelJS from 'exceljs';
import * as adminService from "../services/admin.service";

export const handleReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body;
 
    const result = await adminService.processReturn(Number(id), adminNote);

    res.status(200).json({
      status: "success",
      message: "Proses pengembalian berhasil",
      data: {
        bookingCode: result.bookingCode,
        status: result.status,
        penalty: result.penaltyAmount,
        returnDate: result.actualReturnDate,
        note: result.adminNote
      }
    });
  } catch (error: any) {
    res.status(400).json({ 
      status: "error", 
      message: error.message 
    });
  }
};


export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    
    res.status(200).json({
      status: "success",
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};


export const getBookings = async (req: Request, res: Response) => {
  try {
    // 1. Ambil data dari query dan paksa jadi Number
    const page = Number(req.query.page) || 1; 
    const limit = Number(req.query.limit) || 10;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // 2. Kirim object yang LENGKAP ke service
    const result = await adminService.getAllBookings({ 
      page,    // Sekarang ada page
      limit,   // Sekarang ada limit
      status, 
      search 
    });

    res.status(200).json({
      status: "success",
      ...result 
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { from, to, status } = req.query;

    const report = await adminService.getReportData({
      from: from as string,
      to: to as string,
      status: status as string
    });

    res.status(200).json({
      status: "success",
      message: "Laporan berhasil dimuat",
      data: report
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const downloadExcelReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const bookings = await adminService.getRevenueData(from as string, to as string);

    // 1. Inisialisasi Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Pendapatan');

    // 2. Definisi Header Kolom
    worksheet.columns = [
      { header: 'Tanggal', key: 'tanggal', width: 15 },
      { header: 'Kode Booking', key: 'kode', width: 20 },
      { header: 'Pelanggan', key: 'pelanggan', width: 25 },
      { header: 'Total Sewa', key: 'sewa', width: 15 },
      { header: 'Denda', key: 'denda', width: 15 },
      { header: 'Total Bayar', key: 'total', width: 15 },
      { header: 'Metode', key: 'metode', width: 15 },
    ];

    // 3. Tambahkan Data
    bookings.forEach((b) => {
      worksheet.addRow({
        tanggal: b.createdAt.toLocaleDateString('id-ID'),
        kode: b.bookingCode,
        pelanggan: b.user.name,
        sewa: b.totalPrice,
        denda: b.penaltyAmount || 0,
        total: b.totalPrice + (b.penaltyAmount || 0),
        metode: b.payment?.paymentMethod || "-",
      });
    });

    // 4. Styling Header (Biar keren pas demo TA)
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // 5. Kirim file ke browser
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Laporan-Azka-Outdoor-${from}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};