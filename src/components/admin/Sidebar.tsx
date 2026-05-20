"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Package, 
  Layers, 
  ArrowLeftRight, 
  Users, 
  LogOut,
  Mountain,
  Settings
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function Sidebar({ mounted, user, token, logout }: any) {
  const pathname = usePathname();

  // Variasi ikon disesuaikan agar tidak monoton
  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Semua Pesanan", href: "/admin/allBooking", icon: <ClipboardList size={20} /> },
    { name: "Produk & Paket", href: "/admin/products", icon: <Package size={20} /> },
    { name: "Kategori", href: "/admin/category", icon: <Layers size={20} /> },
    { name: "PickUp & Return", href: "/admin/pickupreturn", icon: <ArrowLeftRight size={20} /> },
    { name: "Pelanggan", href: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-slate-400 p-6 flex flex-col border-r border-slate-800 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 text-white mb-10 px-2">
        <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-600/20">
          <Mountain size={24} className="text-white" />
        </div>
        <span className="text-xl font-black tracking-tighter italic">AZKA ADMIN</span>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 space-y-1">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-4">Menu Utama</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group text-sm",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-bold italic" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-white")}>
                {item.icon}
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      {/* Footer Sidebar */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
       
        
        {/* FORCE RENDER: Tombol dihajar keluar tanpa syarat mounted/token */}
        <button
          onClick={() => {
            // 1. Cek apakah fungsi logout dari props tersedia
            if (logout) {
              logout();
            } else {
              // 2. Jika props logout macet/ga masuk, kita hancurkan token manual biar paksa keluar
              localStorage.clear(); 
              sessionStorage.clear();
              window.location.href = "/"; // Tendang ke halaman utama
            }
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-sm text-red-400 hover:bg-red-500/10 rounded-2xl transition-all font-black uppercase italic tracking-wider text-left"
        >
          <LogOut size={20} className="text-red-400" />
          <span>KELUAR</span>
        </button>
      </div>
    </aside>
  );
}