"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  LogOut,
  Mountain,
  Settings
} from "lucide-react";
import { cn } from "../../../lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { name: "Semua Pesanan", href: "/admin/allBooking", icon: <LayoutDashboard size={20} /> },
    { name: "Pesanan", href: "/admin/bookings", icon: <ShoppingCart size={20} /> },
    { name: "Produk & Paket", href: "/admin/products", icon: <Package size={20} /> },
     { name: "Kategori", href: "/admin/category", icon: <Package size={20} /> },
       { name: "PickUp & Return", href: "/admin/pickupreturn", icon: <Package size={20} /> },
    { name: "Pelanggan", href: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-950 text-slate-400 p-6 flex flex-col border-r border-slate-800 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 text-white mb-10 px-2">
        <div className="bg-primary p-2 rounded-xl">
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
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn(isActive ? "text-white" : "text-slate-500 group-hover:text-white")}>
                {item.icon}
              </span>
              <span className="font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar */}
      <div className="pt-6 border-t border-slate-800 space-y-2">
        <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white transition-all">
          <Settings size={20} />
          <span className="font-medium">Pengaturan</span>
        </Link>
        <button className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-500/10 rounded-2xl transition-all">
          <LogOut size={20} />
          <span className="font-bold">Keluar</span>
        </button>
      </div>
    </aside>
  );
}