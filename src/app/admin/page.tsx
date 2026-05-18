"use client";

import RevenuePage from "@/components/admin/dashboard/RevenueChart";
import RentPage from "@/components/admin/dashboard/RentChart";
import StatusPage from "@/components/admin/dashboard/StatusChart";
import SellingChartPage from "@/components/admin/dashboard/SellingChart";
import CardchartPage from "@/components/admin/dashboard/Card";

export default function AdminDashboard() {
  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Pantau performa Azka Outdoor hari ini.
        </p>
      </div>

      {/* 🔥 KPI CARDS */}
      <CardchartPage />

      {/* 📈 CHART ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenuePage />
        <RentPage />
      </div>

      {/* 📊 CHART ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusPage />
        <SellingChartPage />
      </div>

    </div>
  );
}