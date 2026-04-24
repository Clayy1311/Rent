"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { DashboardStats } from "@/components/admin/DashboardTats";
import { TopItemsList } from "@/components/admin/TopItemList";
import { RecentBookingsTable } from "@/components/admin/RecentBookingsTable";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/admin/stats"); // Sesuaikan endpoint-mu
        setData(res.data.data);
      } catch (err) {
        console.error("Gagal load stats");
      }
    };
    fetchStats();
  }, []);

  if (!data) return <div className="p-8 text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900">DASHBOARD OVERVIEW</h1>
        <p className="text-slate-500">Pantau performa Azka Outdoor hari ini.</p>
      </div>

      <DashboardStats summary={data.summary} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <RecentBookingsTable bookings={data.recentBookings} />
        </div>
        <div>
          <TopItemsList items={data.topItems} />
        </div>
      </div>
    </div>
  );
}