import { Request, Response } from "express"

import * as itemService from "../services/item.service"
import { stat } from "node:fs"

export const getItems = async (req: Request, res: Response) => {

  try {

    const items = await itemService.getAllItems()

    res.json({
      message: "Success",
      data: items
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    })

  }

}

export const deleteItems = async(req: Request, res: Response) =>{
  try{
    const itemId = Number(req.params.id);
    await itemService.deleteItem(itemId);

    res.status(200).json({
      status: "success",
      "message": "succes delete data "
    });
  } catch(error: any){
    res.status(400).json({status: "error", message: error.message});
  }
}

export const getItemById = async (req: Request, res: Response) => {

  try {

    const id = Number(req.params.id)

    const item = await itemService.getItemById(id)

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      })
    }

    res.json({
      message: "Success",
      data: item
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    })

  }

}

export const createItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, categoryId } = req.body;
    
    // Ambil nama file gambar jika ada yang diupload
    const image = req.file ? req.file.filename : null;

    const item = await itemService.createItem({
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      image: image as string, // Nama file yang disimpan di folder uploads
      categoryId: Number(categoryId),
    });

    res.status(201).json({
      success: true,
      message: "Item created successfully",
      data: item,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
export const updateItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    // 1. Cek dulu apakah body-nya ada
    if (!req.body) {
      return res.status(400).json({ message: "Body request kosong" });
    }

    // 2. Ambil gambar kalau ada, kalau nggak ada biarin null
    const image = req.file ? req.file.filename : undefined;

    const { name, description, price, stock } = req.body;

    // 3. Validasi: Jangan kirim NaN ke Prisma!
    const updateData: any = {
      name,
      description,
    };

    // Cuma masukkan ke object kalau angkanya valid
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (image) updateData.image = image;

    // 4. Kirim ke service
    const item = await itemService.updateItem(id, updateData);

    res.json({
      message: "Item updated",
      data: item
    });

  } catch (error: any) {
    console.error("DETAIL ERRORNYA NIH:", error);
    // Tampilkan error asli biar lu gak nebak-nebak
    res.status(500).json({
      message: error.message || "Server error"
    });
  }
};

export const deleteItem = async (req: Request, res: Response) => {

  try {

    const id = Number(req.params.id)

    await itemService.deleteItem(id)

    res.json({
      message: "Item deleted"
    })

  } catch (error: any) {
  console.log(error); // LIHAT DI TERMINAL VS CODE KAMU!
  res.status(500).json({ 
    status: "error", 
    message: error.message // Ini bakal nampilin error aslinya (misal: constraint error)
  }); 
}

}

export const getavailability = async(req: Request, res: Response) => {
try {
  const {startDate, endDate} = req.query;
  const availability = await itemService.getAvailabilityService (
    String(startDate),
    String(endDate)
  )

  return res.status(200).json({
    "success" :"true",
    data: availability
  })
} catch(error: any)
{
  
    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};