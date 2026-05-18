"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import api from "@/lib/axios";
import { Trophy } from "lucide-react";



type Items = {
    name: string;
    total: number
}

export default function SellingChartPage(){
    const [data,setData] = useState<Items[]>([]);
    const [loading,setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async() => {
            try{
                const res = await api.get("/admin/bestselling")
                console.log("data mentah",res)
                setData(res.data.data)
            }catch(err)
            {
                console.log(err);
            }finally{
                setLoading(false);
            }
        };
        fetchData();
    }, [])
    // LOADING
  if (loading) {
    return (
      <Card className="shadow-md rounded-2xl">
        <CardContent className="h-[300px] flex items-center justify-center">
          Loading...
        </CardContent>
      </Card>
    );
  }

  // EMPTY
  if (!data.length) {
    return (
      <Card className="shadow-md rounded-2xl">
        <CardContent className="h-[300px] flex items-center justify-center">
          Tidak ada data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl border border-slate-200">
      {/* HEADER */}
      <CardHeader className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <CardTitle>Barang Terlaris</CardTitle>
      </CardHeader>

      {/* CONTENT */}
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical" // 🔥 horizontal bar
            margin={{ left: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* X = jumlah */}
            <XAxis
              type="number"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            {/* Y = nama item */}
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: "#334155", fontSize: 12 }}
              width={100}
            />

            <Tooltip
              formatter={(value: number) => [
                `${value} disewa`,
                "Total",
              ]}
            />

            <Bar
              dataKey="total"
              fill="#f59e0b"
              radius={[0, 8, 8, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}