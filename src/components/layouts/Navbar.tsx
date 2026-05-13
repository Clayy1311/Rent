"use client";

import { Mountain, LogOut, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CartDialog } from "@/components/features/cartDialog";
import { useModalStore } from "@/store/useModalStore";

export function Navbar({ mounted, user, token, logout }: any) {
  const { openAuth } = useModalStore();

  return (
    // 1. HEADER SEBAGAI WRAPPER STICKY
    <header className="sticky top-0 z-[100] w-full bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <nav className="container mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mountain className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold tracking-tighter text-slate-950">Azka Outdoor</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-700">
          <Link href="#" className="hover:text-primary transition">Katalog</Link>
          
          {mounted && token && user && (
            <Link href="/history" className="text-sm font-medium hover:text-primary transition-colors">
              Riwayat Sewa
            </Link>
          )}
          
          <Link href="#" className="hover:text-primary transition">Paket Bundling</Link>
         
        </div>
        
        <div className="flex items-center gap-4">
          {/* Tampilan User Profile */}
          {mounted && token && user ? (
            <div className="flex items-center gap-3 bg-slate-50 p-1 pr-4 rounded-full border border-slate-200">
              <div className="h-8 w-8 rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.name?.charAt(0)}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">{user?.role}</span>
                <span className="text-sm font-extrabold text-slate-900 leading-tight truncate max-w-[100px]">
                  {user?.name}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout} 
                className="h-8 w-8 text-slate-400 hover:text-red-500 rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : mounted ? (
            <button 
              onClick={openAuth} 
              className="text-sm font-bold text-slate-800 hover:text-primary transition px-6 h-11 border-2 border-transparent hover:border-slate-100 rounded-full"
            >
              Login
            </button>
          ) : null}

          {/* 2. STYLE KERANJANG: DEFAULT PUTIH -> HOVER BIRU */}
          {mounted && (
            token ? (
              <CartDialog />
            ) : (
              <Button 
                variant="outline" 
                onClick={openAuth} 
                className="relative gap-2 rounded-full border-2 border-slate-200 px-6 h-11 bg-white text-slate-900 hover:bg-blue-600 hover:border-blue-600 hover:text-white transition-all duration-300 group shadow-sm"
              >
                <ShoppingCart className="h-5 w-5 text-slate-600 group-hover:text-white transition-colors" />
                <span className="text-sm font-bold uppercase tracking-tight">Keranjangssss</span>
              </Button>
            )
          )}
        </div>
      </nav>
    </header>
  );
}