import { Request, Response } from "express";
import * as packageService from "../services/package.service";

export const listPackages = async (req: Request, res: Response) => {
  try {
    const data = await packageService.getAllPackages();
    res.status(200).json({ status: "success", data });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const checkoutPackage = async (req: Request, res: Response) => {
  try {
    // Ambil userId dari req.user (diisi oleh middleware verifyToken)
    const userId = (req as any).user?.id; 
    
    if (!userId) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const { packageId, startDate, endDate } = req.body;

    const result = await packageService.createPackageBooking(userId, {
      packageId: Number(packageId),
      startDate,
      endDate
    });

    res.status(201).json({
      status: "success",
      message: "Booking paket berhasil dibuat",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const createPackage = async (data: {
  package_name: string;
  description?: string;
  min_capacity: number;
  max_capacity: number;
  discount_price: number;
  items: { itemId: number; quantity: number }[];
}) => {
  return await prisma.$transaction(async (tx) => {
    // 1. Simpan Header Package
    const newPackage = await tx.package.create({
      data: {
        package_name: data.package_name,
        description: data.description,
        min_capacity: data.min_capacity,
        max_capacity: data.max_capacity,
        discount_price: data.discount_price,
      },
    });

    // 2. Simpan Semua Item ke PackageItem
    const packageItemsData = data.items.map((item) => ({
      package_id: newPackage.id,
      item_id: item.itemId,
      quantity: item.quantity,
    }));

    await tx.packageItem.createMany({
      data: packageItemsData,
    });

    return await tx.package.findUnique({
      where: { id: newPackage.id },
      include: { package_items: true },
    });
  });
};

export const updatepackage  = async(req: Request, res: Response) => {
 try{
  const packageID = Number(req.params.id);
  const {package_name, description, min_capacity, max_capacity,discount_price, items} = req.body;
  if (!items || items.length === 0) {
      return res.status(400).json({ status: "error", message: "Isi paket (items) tidak boleh kosong" });
    }
    const itempackage = await packageService.updatepackage(packageID,{
       package_name,
      description,
      min_capacity: Number(min_capacity),
      max_capacity: Number(max_capacity),
      discount_price: Number(discount_price),
      items
    })
    return res.status(200).json({"message": "berhasil update data", data: itempackage});
  
 } catch(error: any){
  res.status(400).json({status: "error", "message": error.message});
 }
}
export const createNewPackage = async (req: Request, res: Response) => {
  try {
    const { package_name, description, min_capacity, max_capacity, discount_price, items } = req.body;

    // Validasi sederhana: pastikan ada item yang dikirim
    if (!items || items.length === 0) {
      return res.status(400).json({ status: "error", message: "Isi paket (items) tidak boleh kosong" });
    }

    const result = await packageService.createPackage({
      package_name,
      description,
      min_capacity: Number(min_capacity),
      max_capacity: Number(max_capacity),
      discount_price: Number(discount_price),
      items
    });

    res.status(201).json({
      status: "success",
      message: "Paket berhasil dibuat",
      data: result
    });
  } catch (error: any) {
    res.status(400).json({ status: "error", message: error.message });
  }
};

export const getDetailPackage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pkg = await packageService.getPackageById(Number(id));

    if (!pkg) {
      return res.status(404).json({ 
        status: "error", 
        message: "Paket tidak ditemukan" 
      });
    }

    // Kita hitung harga asli (sebelum diskon) untuk ditampilkan di UI
    const originalPrice = pkg.package_items.reduce((total, pi) => {
      return total + (pi.item.price * pi.quantity);
    }, 0);

    const finalPrice = originalPrice - pkg.discount_price;

    res.status(200).json({
      status: "success",
      data: {
        ...pkg,
        originalPrice,
        finalPrice
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

export const deletepackage = async(req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
     await packageService.deletepackage(id);
    return res.status(200).json({
      "message": "success delete data",
    })
  }  catch(error: any){
  res.status(400).json({status: "error", message: error.message} );
  }
}