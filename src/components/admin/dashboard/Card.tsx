"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign } from "lucide-react";

type Revenue = {
    currentMonthTotal: number;
    totalRevenue: number;
    lastMonthTotal: number;
    growth: string;
}

//format rp
function formatRupiah(value: number | string): string {
  if (!value && value !== 0) return "Rp 0";
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericValue).replace("Rp", "Rp ");
}

export default function CardchartPage(){
    const [data,setData] = useState<Revenue | null>(null);
    const [loading, setLoading] = useState(true)


    useEffect(() => {
        const fetchData = async() => {
            try{
                const res = await api.get("/admin/revenue-summary")
                console.log("data mentah revenue-summary", res)
                setData(res.data.data)
            }catch(err){
                console.log(err);
            }finally{
                setLoading(false)
            }
        } ;
        fetchData();
    }, [])
console.log("data revenuse-summary", data);


    if(loading){
        return(
            <span>Loading...</span>
        )
    }
    if(!data){
        return(
            <span>Data tidak ada</span>
        )
    }

    return(
       <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="rounded-2xl bg-blue-500 shadow-md border border-sm border-slate-200 hover:shadow-lg gap-3 text-white">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <span>Total Pendapatan</span>
            
            <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600">
                </DollarSign>
            </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
              {formatRupiah(data.totalRevenue)}
            </h2>
            </CardContent>  

        </Card>

          <Card className="rounded-2xl bg-yellow-500 shadow-md border border-sm border-slate-200 hover:shadow-lg gap-3 text-white">
          <CardContent className="p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
                <span>Pendapatan Bulan ini</span>
            
            <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600">
                </DollarSign>
            </div>
            </div>
            <h2 className="text-2xl font-bold text-white">
                {formatRupiah(data.currentMonthTotal)}
            </h2>
            </CardContent>  
        </Card>

  
       </div>
    )
}