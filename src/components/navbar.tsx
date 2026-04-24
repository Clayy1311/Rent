"use client";

import Link from "next/link";
import { ChevronLeft, Home, ShoppingBag } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/" 
            className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-600"
            title="Kembali ke Beranda"
          >
            <ChevronLeft size={24} />
          </Link>
          <span className="font-bold text-slate-900 tracking-tight">Azka Outdoor</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-2">
            <Home size={18} />
            <span className="hidden sm:inline">Beranda</span>
          </Link>
          <Link href="/history" className="text-sm font-semibold text-indigo-600 flex items-center gap-2">
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Pesanan Saya</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}