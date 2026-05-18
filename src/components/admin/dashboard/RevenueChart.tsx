"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/axios";

// TYPE DATA
type Revenue = {
  month: string;
  total: number;
};

export default function RevenuePage() {
  const [data, setData] = useState<Revenue[]>([]);
  const [loading, setLoading] = useState(true);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/revenue");
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // LOADING
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
          Tidak ada data pendapatan
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg rounded-2xl border border-slate-200">
      {/* HEADER */}
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">
          Pendapatan Bulanan
        </CardTitle>

        <span className="text-sm text-slate-500">
          Tahun 2026
        </span>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="pt-2">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            {/* GRADIENT */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>

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
            />

            {/* LINE */}
            <Line
              type="monotone"
              dataKey="total"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}