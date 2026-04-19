import { Request, Response } from "express"

import * as itemService from "../services/item.service"

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

    const id = Number(req.params.id)

    const { name, description, price, stock } = req.body

    const item = await itemService.updateItem(id, {
      name,
      description,
      price: Number(price),
      stock: Number(stock)
    })

    res.json({
      message: "Item updated",
      data: item
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    })

  }

}

export const deleteItem = async (req: Request, res: Response) => {

  try {

    const id = Number(req.params.id)

    await itemService.deleteItem(id)

    res.json({
      message: "Item deleted"
    })

  } catch (error) {

    res.status(500).json({
      message: "Server error"
    })

  }

}