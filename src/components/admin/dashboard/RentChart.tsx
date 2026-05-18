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
import { BarChart3 } from "lucide-react";

// TYPE DATA
type Rent = {
  month: string;
  total: number;
};

export default function RentPage() {
  const [data, setData] = useState<Rent[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/rent");
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // LOADING STATE
  if (loading) {
    return (
      <Card className="shadow-md rounded-2xl">
        <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
          Loading data...
        </CardContent>
      </Card>
    );
  }

  // EMPTY STATE
  if (!data.length) {
    return (
      <Card className="shadow-md rounded-2xl">
        <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
          Tidak ada data penyewaan
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl border border-slate-200">
      {/* HEADER */}
      <CardHeader className="flex items-center justify-between flex-row">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-green-500" />
          <CardTitle className="text-lg font-semibold">
            Jumlah Penyewaan Bulanan
          </CardTitle>
        </div>

        <span className="text-sm text-slate-500">Tahun 2026</span>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            {/* GRID */}
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* AXIS */}
            <XAxis
              dataKey="month"
              tick={{ fill: "#64748b", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "#64748b", fontSize: 12 }}
            />

            {/* TOOLTIP */}
            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
              formatter={(value: number) => [`${value} transaksi`, "Jumlah"]}
            />

            {/* BAR */}
            <Bar
              dataKey="total"
              fill="#22c55e"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}