import { Request,Response } from "express";
import * as CategoryServices from "../services/category.services"


export const getAllCategory = async(req: Request, res: Response) => {

    try{
        const datas = await CategoryServices.getAllCategory()

        res.json({
            message: "succes get Category",
            data: datas
        })
    } catch(error: any){
        res.status(500).json({
            message: "Server error"
          })
    }
}

export const CreateCategory = async(req: Request, res: Response) => {
     try {
        const {name} = req.body;
        const datas = await CategoryServices.CreateCategory(name)

        res.json({
            message: "success create data categoy",
            data: datas
        })
     }catch(error) {
        res.status(500).json({
            message: "server error"
        })
     }
}

export const DeleteCategory = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const category = await CategoryServices.DeleteCategory(id);

    res.json({
      message: "success delete data category",
      data: category
    });

  } catch (error) {
    res.status(500).json({
      message: "server error",
      error
    });
  }
};
