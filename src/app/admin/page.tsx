"use client";

import RevenuePage from "@/components/admin/dashboard/RevenueChart";
import RentPage from "@/components/admin/dashboard/RentChart";
import StatusPage from "@/components/admin/dashboard/StatusChart";
import SellingChartPage from "@/components/admin/dashboard/SellingChart";
import CardchartPage from "@/components/admin/dashboard/Card";
import TestApiPage from "@/components/admin/TestApi";

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

      {/* 🔥 DOWNLOAD REPORT SECTION */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 p-7  shadow-sm gap">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        
        </div>
        
        {/* 🔥 KPI CARDS */}
        <CardchartPage />
        
      </div>

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
