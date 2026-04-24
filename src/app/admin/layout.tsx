"use client";

import { Sidebar } from "@/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white text-slate-900">
      {/* Sidebar - Lebar 64 (256px) */}
      <Sidebar />

      {/* Main Content - Kasih margin kiri sebesar lebar sidebar */}
      <main className="flex-1 ml-64 p-10 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}