"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { 
  ChevronLeft, 
  Calendar, 
  Package, 
  CreditCard, 
  AlertCircle,
  CheckCircle2,
  Timer,
  Receipt
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { Badge } from "@/components/ui/badge";

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id; // Mengambil ID dari URL
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:3001/bookings/mybookingsdetail/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        setBooking(result);
      } catch (error) {
        console.error("Gagal ambil detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token && bookingId) fetchDetail();
  }, [token, bookingId]);

  // Fungsi Helper untuk mencegah error "preprocessor" date-fns
  const safeFormat = (dateString: string | undefined, formatStr: string) => {
    if (!dateString) return "---";
    try {
      const date = new Date(dateString);
      // Cek apakah tanggal valid
      if (isNaN(date.getTime())) return "---";
      return format(date, formatStr, { locale: localeId });
    } catch (error) {
      return "---";
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      <p className="text-slate-500 font-medium">Memuat detail pesanan...</p>
    </div>
  );

  if (!booking) return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Data pesanan tidak ditemukan.</p>
        <Link href="/history" className="text-indigo-600 font-bold hover:underline">Kembali ke Riwayat</Link>
      </div>
    </div>
  );

  const isExpired = booking.status === "EXPIRED";
  const handleDownloadInvoice = async (bookingId: number) => {
    try {
      const res = await fetch(`http://localhost:3001/bookings/${bookingId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (!res.ok) throw new Error("Gagal mengambil file invoice");
  
   
      const blob = await res.blob();
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-booking-${bookingId}.pdf`; 
      document.body.appendChild(a);
      a.click(); 
      a.remove();
      window.URL.revokeObjectURL(url);
  
    } catch (error) {
      console.error("Gagal download invoice:", error);
      alert("Terjadi kesalahan saat mengunduh invoice.");
    }
  };
  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar />

      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Tombol Kembali */}
        <Link href="/history" className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-6 group w-fit">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Kembali ke Riwayat</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: Info Utama & Daftar Barang */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Detail Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">Detail Pesanan</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Receipt size={14} className="text-slate-400" />
                    <p className="text-slate-500 font-mono text-sm uppercase">{booking.bookingCode}</p>
                  </div>
                </div>
                <Badge className={`px-4 py-1.5 rounded-full font-bold uppercase text-[10px] tracking-widest border shadow-none ${
                  isExpired ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                }`}>
                  {isExpired ? "Expired" : booking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-50">
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durasi Sewa</p>
                    <p className="text-sm font-bold text-slate-700">
                      {safeFormat(booking.startDate, "dd MMM yyyy")} - {safeFormat(booking.endDate, "dd MMM yyyy")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Timer size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batas Pembayaran</p>
                    <p className="text-sm font-bold text-slate-700">
                      {safeFormat(booking.expiredAt, "dd MMM yyyy, HH:mm")} WIB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* List Item Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center gap-2 mb-6">
                <Package className="text-indigo-600" size={20} />
                <h2 className="font-bold text-slate-900">Peralatan yang Disewa</h2>
              </div>
              
              <div className="space-y-4">
                {booking.items?.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 ring-1 ring-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="w-16 h-16 rounded-xl bg-slate-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={`http://localhost:3001/uploads/${item.item.image}`} 
                        className="w-full h-full object-cover" 
                        alt={item.item.name}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm uppercase truncate">{item.item.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {item.quantity} Unit x Rp {item.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <p className="font-bold text-slate-900 text-sm">
                      Rp {(item.quantity * item.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: Ringkasan Biaya & User */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-slate-900 rounded-[24px] p-6 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
              
             <div className="relative z-10">
  <div className="flex items-center gap-2 mb-8 opacity-80">
    <CreditCard size={18} />
    <p className="text-xs font-bold uppercase tracking-widest">Ringkasan Biaya</p>
  </div>
  
  <div className="space-y-4">
    {/* Info Biaya tetap sama */}
    <div className="flex justify-between text-sm">
      <span className="opacity-60 text-slate-400">Total Item</span>
      <span className="font-medium text-slate-200">{booking.items?.length || 0} Macam</span>
    </div>
    <div className="pt-4 border-t border-white/10 flex justify-between items-end">
      <span className="text-xs font-bold uppercase opacity-60 text-indigo-300">Total Tagihan</span>
      <span className="text-2xl font-black text-white">
        Rp {booking.totalPrice?.toLocaleString('id-ID')}
      </span>
    </div>
  </div>

  {/* --- LOGIKA STATUS TOMBOL START --- */}
  <div className="mt-8">
    {booking.status === "PENDING_PAYMENT" && (
      <Link href={`/payment/${booking.id}`}>
        <button className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-900/40 flex items-center justify-center gap-2 group">
          Bayar Sekarang
          <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
        </button>
      </Link>
    )}

    {booking.status === "WAITING_CONFIRMATION" && (
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
        <Timer size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed text-amber-100/90 font-medium">
          Pembayaran sedang ditinjau. Silakan tunggu maksimal 1 x 12 jam untuk proses verifikasi admin.
        </p>
      </div>
    )}

    {booking.status === "RENTED" && (
      <button 
        onClick={() => handleDownloadInvoice(bookingId)} // Atau arahkan ke endpoint PDF invoice
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 group"
      >
        <Receipt size={18} />
        Download Invoice
      </button>
    )}

    {booking.status === "EXPIRED" && (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3">
        <AlertCircle className="text-red-400 flex-shrink-0" size={18} />
        <p className="text-[11px] leading-relaxed text-red-200/80 font-medium">
          Batas waktu pembayaran habis. Pesanan ini sudah tidak bisa dilanjutkan.
        </p>
      </div>
    )}
  </div>
  {/* --- LOGIKA STATUS TOMBOL END --- */}

              </div>
            </div>

            {/* Info Profil Penyewa */}
            <div className="bg-white rounded-[24px] p-6 shadow-sm ring-1 ring-slate-100">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Penyewa</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold">
                  {booking.user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 text-sm truncate">{booking.user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{booking.user?.email}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}