import e, { Request, Response } from "express";
import ExcelJS from "exceljs";
import * as adminService from "../services/admin.service";
import { json } from "node:stream/consumers";

// Controller untuk Handle Pengambilan Barang
export const handlePickUp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await adminService.confirmPickUp(Number(id));

    res.status(200).json({
      status: "success",
      message: "Status berhasil diubah ke RENTED. Barang resmi dipinjam.",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

// Controller untuk Handle Pengembalian Barang
export const handleReturn = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { adminNote } = req.body || {};

    const result = await adminService.processReturn(Number(id), adminNote);

    res.status(200).json({
      status: "success",
      message: "Pengembalian berhasil diproses",
      data: {
        booking: result,
        autoPenalty: result.penaltyAmount, // Menampilkan denda yang terhitung
      },
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getDashboardData = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      status: "success",
      data: stats,
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

    
    const result = await adminService.getAllBookings({
      page, // Sekarang ada page
      limit, // Sekarang ada limit
      status,
      search,
    });

    res.status(200).json({
      status: "success",
      ...result,
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
      status: status as string,
    });

    res.status(200).json({
      status: "success",
      message: "Laporan berhasil dimuat",
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const downloadExcelReport = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const bookings = await adminService.getRevenueData(
      from as string,
      to as string,
    );

    // 1. Inisialisasi Workbook & Worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Laporan Pendapatan");

    // Tampilkan Gridlines (Garis pembatas cell agar rapi)
    worksheet.views = [{ showGridLines: true }];

    // 2. Definisi Header Kolom
    worksheet.columns = [
      { header: "Tanggal", key: "tanggal", width: 15 },
      { header: "Kode Booking", key: "kode", width: 22 },
      { header: "Pelanggan", key: "pelanggan", width: 28 },
      { header: "Total Sewa", key: "sewa", width: 18 },
      { header: "Denda", key: "denda", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Total Bayar", key: "total", width: 20 },
    ];

    // 3. Tambahkan Data Pelanggan
    bookings.forEach((b) => {
      worksheet.addRow({
        tanggal: b.createdAt ? new Date(b.createdAt).toLocaleDateString("id-ID") : "-",
        kode: b.bookingCode,
        pelanggan: b.user?.name || "-",
        sewa: Number(b.totalPrice) || 0,
        denda: Number(b.penaltyAmount) || 0,
        status: b.status,
        // Menggunakan formula Excel untuk row ini agar dinamis: =D{row} + E{row}
        total: Number(b.totalPrice) + (Number(b.penaltyAmount) || 0),
      });
    });

    // 4. LOGIC MENGHITUNG TOTAL (Menggunakan Formula Excel SUM)
    const lastRowIndex = worksheet.rowCount;
    const totalRowIndex = lastRowIndex + 1;

    // Tambahkan Row Baru Khusus Total di paling bawah
    const totalRow = worksheet.addRow({
      tanggal: "TOTAL PENDAPATAN",
      kode: "",
      pelanggan: "",
      // Rumus SUM otomatis dari baris ke-2 sampai baris data terakhir
      sewa: { formula: `=SUM(D2:D${lastRowIndex})` },
      denda: { formula: `=SUM(E2:E${lastRowIndex})` },
      status: "",
      total: { formula: `=SUM(G2:G${lastRowIndex})` },
    });

    const totalExcel = bookings.reduce(
  (sum, b) =>
    sum +
    Number(b.totalPrice || 0) +
    Number(b.penaltyAmount || 0),
  0
);


    // Gabungkan (Merge) cell A sampai C untuk tulisan "TOTAL PENDAPATAN"
    worksheet.mergeCells(`A${totalRowIndex}:C${totalRowIndex}`);

    // 5. STYLING LEVEL PRO (Biar Dosen Penguji Kagum ✨)
    
    // Style untuk Header (Baris 1)
    const headerRow = worksheet.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "10B981" }, // Warna Hijau Emerald (Matching dengan UI Web)
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "medium" },
      };
    });

    // Style untuk Baris Data & Format Rupiah
    for (let i = 2; i <= lastRowIndex; i++) {
      const row = worksheet.getRow(i);
      row.height = 20;
      row.alignment = { vertical: "middle" };

      // Format Angka ke Rupiah untuk kolom Sewa (D), Denda (E), dan Total (G)
      row.getCell("D").numFmt = '"Rp "#,##0';
      row.getCell("E").numFmt = '"Rp "#,##0';
      row.getCell("G").numFmt = '"Rp "#,##0';
      
      // Center alignment untuk Tanggal, Kode, dan Status
      row.getCell("A").alignment = { horizontal: "center", vertical: "middle" };
      row.getCell("B").alignment = { horizontal: "center", vertical: "middle" };
      row.getCell("F").alignment = { horizontal: "center", vertical: "middle" };
    }

    // Style Khusus untuk Baris TOTAL (Baris Paling Bawah)
    totalRow.height = 24;
    totalRow.getCell("A").font = { name: "Arial", size: 11, bold: true };
    totalRow.getCell("A").alignment = { horizontal: "center", vertical: "middle" };

    ["D", "E", "G"].forEach((colKey) => {
      const cell = totalRow.getCell(colKey);
      cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "047857" } }; // Text hijau gelap
      cell.numFmt = '"Rp "#,##0';
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E6F4EA" }, // Background hijau tipis
      };
      cell.border = {
        top: { style: "thin", color: { argb: "10B981" } },
        bottom: { style: "double", color: { argb: "10B981" } }, // Garis dua di bawah khas akuntansi
      };
    });

    // 6. Kirim file ke browser dengan penamaan yang aman
    const fileName = `Laporan-Pendapatan-${from || "Semua"}-dan-${to || "Semua"}.xlsx`;
    
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`,
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error: any) {
    console.error("Excel Export Error:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};
export const getDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = await adminService.getBookingDetail(Number(id));

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getMonthlyRevenueService();

    return res.status(200).json({
      success: "true",
      message: "data Revenue:",
      data: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: "error",
    });
  }
};
export const getRentController = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getRentService();
    return res.status(200).json({
      success: "true",
      data: data,
    });
  } catch (error: any) {
    return res.json(400).json({
      message: error.message,
    });
  }
};
export const getStatusController = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getStatusService();
    return res.status(200).json({
      succes: "true",
      data: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getItemBestSellingController = async (
  req: Request,
  res: Response,
) => {
  try {
    const data = await adminService.getItemBestSelling();
    return res.status(200).json({
      success: "true",
      data: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const data = await adminService.getAllUsers();
    return res.status(200).json({
      success: "true",
      data: data,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

export const getTotalrevenueController = async(req: Request,res: Response) => {
  try{
    const data = await adminService.RevenueSummary();
    return res.status(200).json({
      "success" : "true",
      "data" : data

    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}


export const createAdminBookingController = async (
  req: Request,
  res: Response
) => {
  try {
    // 🔥 ambil admin dari middleware (kalau pakai auth)
    const adminId = (req as any).user?.id;

    // 🔥 ambil body
    const {
      name,
      phoneNumber,
      startDate,
      endDate,
      paymentMethod,
      items,
      discount
    } = req.body;

   
    if (!name || !phoneNumber || !startDate || !endDate) {
      return res.status(400).json({
        message: "Data tidak lengkap",
      });
    }

    if (!items || !items.length) {
      return res.status(400).json({
        message: "Item tidak boleh kosong",
      });
    }

    if (!["CASH", "TRANSFER", "QRIS"].includes(paymentMethod)) {
      return res.status(400).json({
        message: "Metode pembayaran tidak valid",
      });
    }


    const result = await adminService.createAdminBooking(adminId, {
      name,
      phoneNumber,
      startDate,
      endDate,
      paymentMethod,
      items,
      discount: discount ? Number(discount) : 0
    });

    return res.status(201).json({
      message: "Booking admin berhasil",
      data: result,
    });

  } catch (error: any) {
    console.error("ADMIN BOOKING ERROR:", error);

    return res.status(500).json({
      message: error.message || "Internal server error",
    });
  }
};

export const GetAllTransaction = async(req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit)||10;
  const search = String(req.query.search);
  try{
    const data = await adminService.GetAllTransactionService(page,limit,search);
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  } catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}

export const ArchiveItem = async(req: Request, res: Response) => {
  const id = Number(req.params.id);
  try{
    const data = await adminService.ArchiveItemService(id);
    return res.status(200).json({
      "succes": true,
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const UnarchiveItem = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const data = await adminService.UnarchiveItemService(id)
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const ArchivePackage = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const data = await adminService.ArchivePackageService(id)
    return res.status(200).json({
      "success" : "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}

export const UnarchivePackage = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const data= await adminService.UnarchivePakcageService(id)
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const ArchiveCategory = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const data = await adminService.ArchiveCategoryService(id)
    return res.status(200).json({
      "success" : "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const UnarchiveCategory = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const data= await adminService.UnarchiveCategoryService(id)
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const GetAllArchiveItem = async(req: Request, res: Response) => {
  try{
    const data = await adminService.GetAllArchiveItemService()
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const GetAllArchivePackage = async(req: Request, res: Response) => {
  try{
    const data = await adminService.GetAllArchivePackageService()
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}
export const GetAllArchiveCategory = async(req: Request, res: Response) => {
  try{
    const data = await adminService.GetAllArchiveCategoryService()
    return res.status(200).json({
      "success": "true",
      "data": data
    })
  }catch(error: any){
    return res.status(400).json({
      "message": error.message
    })
  }
}