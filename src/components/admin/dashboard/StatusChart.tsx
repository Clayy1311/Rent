"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
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
import { PieChart as PieIcon } from "lucide-react";

// TYPE
type StatusData = {
  status: string;
  total: number;
};

// Konfigurasi status & label (Termasuk handling typo backend CONFRIMED)
const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  RENTED: { label: "Disewa", color: "#22c55e" },
  FINISHED: { label: "Selesai", color: "#f59e0b" },
 
};

const COLORS = ["#22c55e", "#f59e0b", ];

export default function StatusChart() {
  const [data, setData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/admin/status");
        setData(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-md rounded-2xl">
        <CardContent className="h-[300px] flex items-center justify-center">
          Loading...
        </CardContent>
      </Card>
    );
  }

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
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-base font-semibold">Status Booking</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-0">
        
        {/* CHART CONTAINER */}
        <div className="w-full h-[220px] md:col-span-8 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={40} 
                outerRadius={70} 
                paddingAngle={3}
              >
                {data.map((entry, index) => {
                  const statusKey = entry.status.toUpperCase();
                  const config = STATUS_CONFIG[statusKey];

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={config?.color || COLORS[index % COLORS.length]}
                    />
                  );
                })}
              </Pie>

              <Tooltip
                formatter={(value: number, name: string) => {
                  const config = STATUS_CONFIG[name.toUpperCase()];
                  return [`${value} data`, config?.label || name];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LEGEND CONTAINER (Simpel & Bersih) */}
        <div className="flex flex-col gap-2 md:col-span-4 justify-center w-full">
          {data.map((item, index) => {
            const statusKey = item.status.toUpperCase();
            const config = STATUS_CONFIG[statusKey];
            const totalData = item.total;

            return (
              <div 
                key={`legend-${index}`} 
                className="flex items-center gap-2 bg-slate-50/70 px-2.5 py-1.5 rounded-md border border-slate-100"
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{
                    backgroundColor:
                      config?.color || COLORS[index % COLORS.length],
                  }}
                />
                <span className="text-xs font-medium text-slate-600 truncate">
                  {config?.label || item.status}
                  
                </span>
                <span>
                  {totalData}
                </span>
              </div>
            );
          })}
        </div>

      </CardContent>
    </Card>
  );
}