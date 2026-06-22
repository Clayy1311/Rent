"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

type Revenue = {
  currentMonthTotal: number;
  totalRevenue: number;
  lastMonthTotal: number;
  growth: number;
};

// format rupiah
function formatRupiah(value: number | string): string {
  if (!value && value !== 0) return "Rp 0";
  const numericValue =
    typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numericValue)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(numericValue);
}

export default function CardchartPage() {
  const [data, setData] = useState<Revenue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/revenue-summary");
        setData(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <span>Loading...</span>;
  if (!data) return <span>Data tidak ada</span>;

  const isGrowthPositive = data.growth >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* TOTAL REVENUE */}
      <Card className="rounded-2xl bg-blue-600 text-white shadow-md">
        <CardContent className="p-5 flex flex-col gap-3">
          <span className="text-sm opacity-80">
            Total Pendapatan
          </span>

          <h2 className="text-2xl font-bold">
            {formatRupiah(data.totalRevenue)}
          </h2>

          
        </CardContent>
      </Card>

      {/* CURRENT MONTH */}
      <Card className="rounded-2xl bg-emerald-600 text-white shadow-md">
        <CardContent className="p-5 flex flex-col gap-3">
          <span className="text-sm opacity-80">
            Pendapatan Bulan Ini
          </span>

          <h2 className="text-2xl font-bold">
            {formatRupiah(data.currentMonthTotal)}
          </h2>

          <div className="flex items-center gap-2 text-xs opacity-80">
            {isGrowthPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}

            {data.growth}% dari bulan lalu
          </div>
        </CardContent>
      </Card>

      {/* LAST MONTH */}
      <Card className="rounded-2xl bg-yellow-500 text-white shadow-md">
        <CardContent className="p-5 flex flex-col gap-3">
          <span className="text-sm opacity-80">
            Pendapatan Bulan Lalu
          </span>

          <h2 className="text-2xl font-bold">
            {formatRupiah(data.lastMonthTotal)}
          </h2>

          <span className="text-xs opacity-80">
            Sebagai pembanding performa
          </span>
        </CardContent>
      </Card>

    </div>
  );
}