"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ShoppingBag, 
  Clock, 
  ChevronRight, 
  Calendar, 
  Receipt,
  PackageCheck,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function HistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();
  const {user} = useAuthStore();
   
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const id = user.id;
        const res = await fetch(`http://localhost:3001/bookings/mybookings/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const result = await res.json();
        if (result.message === "success") {
          setBookings(result.data);
        }
      } catch (error) {
        console.error("Gagal ambil history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchHistory();
  }, [token]);

  // ... (Fungsi getStatusStyle tetap sama seperti sebelumnya)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return {
          label: "Menunggu Pembayaran",
          class: "bg-orange-50 text-orange-600 border-orange-200",
          icon: <Clock className="w-3 h-3 mr-1" />
        };
      case "CONFIRMED":
        return {
          label: "Dikonfirmasi",
          class: "bg-emerald-50 text-emerald-600 border-emerald-200",
          icon: <PackageCheck className="w-3 h-3 mr-1" />
        };
      case "EXPIRED":
        return {
          label: "Kadaluwarsa",
          class: "bg-slate-50 text-slate-500 border-slate-200",
          icon: <AlertCircle className="w-3 h-3 mr-1" />
        };
      default:
        return { label: status, class: "bg-slate-50 text-slate-600", icon: null };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-[#f8fafc]">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse tracking-wide">Menyiapkan petualanganmu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar />
      
      {/* Container Utama: mx-auto agar ke tengah */}
      <div className="container max-w-5xl mx-auto px-4 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
              Dashboard Pelanggan
            </div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Riwayat Sewa</h1>
            <p className="text-slate-500 text-lg">Kelola dan pantau semua pesanan alat outdoor Anda.</p>
          </div>
          
          <div className="hidden md:block">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium leading-none mb-1">Total Pesanan</p>
                <p className="text-lg font-bold text-slate-900 leading-none">{bookings.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid gap-6">
          {bookings.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] py-24 text-center">
               <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <ShoppingBag size={40} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Belum ada petualangan?</h3>
              <p className="text-slate-500 mt-2 max-w-xs mx-auto">Sepertinya Anda belum memesan alat apapun.</p>
              <Link href="/" className="inline-block mt-8 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Cari Alat Sekarang
              </Link>
            </div>
          ) : (
            bookings.map((booking: any) => {
              const status = getStatusStyle(booking.status);
              return (
                <Card key={booking.id} className="border-none shadow-sm hover:shadow-md transition-all duration-300 rounded-[24px] overflow-hidden bg-white ring-1 ring-slate-100">
                  <CardContent className="p-0">
                    <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[11px] font-mono font-medium flex items-center gap-2">
                          <Receipt size={14} className="text-slate-400" />
                          {booking.bookingCode}
                        </div>
                        <div className="flex items-center text-slate-400 text-xs font-medium">
                          <Calendar size={14} className="mr-1.5" />
                          {format(new Date(booking.createdAt), "dd MMM yyyy", { locale: id })}
                        </div>
                      </div>
                      <Badge className={`px-4 py-1.5 rounded-full border shadow-none font-bold text-[11px] uppercase tracking-wide ${status.class}`}>
                        {status.icon}
                        {status.label}
                      </Badge>
                    </div>

                    <div className="p-6">
                      <div className="space-y-6">
                        {booking.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-5">
                            <div className="h-20 w-20 rounded-2xl bg-slate-100 overflow-hidden ring-1 ring-slate-100 flex-shrink-0 text-center content-center">
                              <img 
                                src={`http://localhost:3001/uploads/${item.item.image}`} 
                                alt={item.item.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-bold text-slate-900 truncate uppercase tracking-tight">
                                {item.item.name}
                              </h4>
                              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                                <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-xs">
                                  {item.quantity} Unit
                                </span>
                                <span className="mx-1">•</span>
                                <span className="text-xs italic">
                                  {format(new Date(booking.startDate), "dd MMM", { locale: id })} - {format(new Date(booking.endDate), "dd MMM", { locale: id })}
                                </span>
                              </p>
                            </div>
                            <div className="hidden sm:block text-right">
                              <p className="text-xs text-slate-400 font-medium mb-1">Harga Satuan</p>
                              <p className="text-base font-black text-slate-900 leading-none">
                                Rp {item.price.toLocaleString('id-ID')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mb-1">Total Transaksi</p>
                        <p className="text-xl font-black text-indigo-600">
                          Rp {booking.totalPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <Link href={`/history/${booking.id}`} className="w-full sm:w-auto">
                        <button className="w-full bg-white hover:bg-slate-900 hover:text-white text-slate-900 border border-slate-200 px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 group">
                          Detail Tagihan
                          <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}