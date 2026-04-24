"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  Upload, 
  ChevronLeft, 
  CreditCard, 
  Info,     
  CheckCircle2, 
  Loader2,
  Package,
  Calendar,
  AlertCircle,
  Timer
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { format, differenceInSeconds } from "date-fns";
import { id as localeId } from "date-fns/locale";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { token } = useAuthStore();
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // State untuk Countdown
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchBookingDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/bookings/mybookingsdetail/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        if (res.ok) {
          setBooking(result);
        } else {
          setError(true);
        }
      } catch (error) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id && token) fetchBookingDetail();
  }, [id, token]);

  // LOGIKA COUNTDOWN
  useEffect(() => {
    if (!booking?.expiredAt || isExpired) return;

    const timer = setInterval(() => {
        const now = new Date();
        const expiry = new Date(booking.expiredAt);
        const diff = differenceInSeconds(expiry, now);
  
        if (diff <= 0) {
          clearInterval(timer);
          setTimeLeft("00:00");
          setIsExpired(true);
        } else {
          // MODIFIKASI: Ambil sisa menit dari jam (maksimal 59)
          // Jika selisihnya memang cuma 15 menit, ini akan jadi 15
          // Jika selisihnya 24 jam 15 menit, ini tetap akan tampil 15
          const minutes = Math.floor((diff % 3600) / 60); 
          const seconds = diff % 60;
  
          setTimeLeft(
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }
      }, 1000);

    return () => clearInterval(timer);
  }, [booking, isExpired]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async () => {
    if (isExpired) return alert("Waktu pembayaran sudah habis!");
    if (!file) return alert("Pilih bukti pembayaran dulu ya!");

    setUploading(true);
    const formData = new FormData();
    formData.append("paymentProof", file);

    try {
      const res = await fetch(`http://localhost:3001/payments/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        alert("Bukti pembayaran berhasil diupload!");
        router.push("/history");
      } else {
        alert("Gagal mengupload bukti pembayaran.");
      }
    } catch (error) {
      console.error("Error upload:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <Navbar />

      <div className="container max-w-2xl mx-auto px-4 py-12">
        <Link href={`/history`} className="flex items-center text-slate-500 hover:text-indigo-600 mb-8 group w-fit">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-sm">Kembali ke Riwayat</span>
        </Link>

        {/* Banner Expired */}
        {isExpired && (
          <div className="mb-6 bg-red-50 border border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-600 animate-pulse">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">Batas waktu pembayaran telah habis. Silakan buat pesanan baru.</p>
          </div>
        )}

        <div className={`bg-white rounded-[32px] shadow-sm ring-1 ring-slate-100 overflow-hidden ${isExpired ? "opacity-60 grayscale pointer-events-none" : ""}`}>
          <div className="p-8 bg-slate-900 text-white">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400">
                  <CreditCard size={20} />
                </div>
                <h1 className="text-xl font-bold">Konfirmasi Pembayaran</h1>
              </div>
              
              {/* COUNTDOWN UI */}
              {!loading && !error && booking && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isExpired ? "border-red-500 text-red-500" : "border-amber-500 text-amber-500"} bg-white/5`}>
                  <Timer size={16} className="animate-pulse" />
                  <span className="text-sm font-mono font-bold">{timeLeft || "--:--"}</span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex items-center gap-2 py-4"><Loader2 size={18} className="animate-spin text-indigo-400" /></div>
            ) : error || !booking ? (
              <div className="bg-red-500/10 p-4 rounded-2xl flex items-center gap-3 text-red-400"><AlertCircle size={20} /><p className="text-sm">Gagal memuat detail tagihan.</p></div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Transfer</p>
                  <p className="text-3xl font-black text-indigo-400">
                    Rp {booking.totalPrice?.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Item yang disewa:</p>
                  {booking.items?.map((detail: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <Package size={16} className="text-indigo-400" />
                        <span className="text-sm font-medium text-slate-200">{detail.item?.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">x{detail.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-sm text-slate-400 border-t border-white/5 pt-4">
                  <Calendar size={16} className="text-indigo-400" />
                  <span>
                    {format(new Date(booking.startDate), "dd MMM", { locale: localeId })} - {format(new Date(booking.endDate), "dd MMM yyyy", { locale: localeId })}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="p-8">
            <div className="bg-indigo-600/5 border border-indigo-500/10 p-5 rounded-[24px] mb-8">
              <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-1">Bank BCA (Transfer)</p>
              <p className="text-2xl font-black tracking-wider text-slate-900">1234 5678 90</p>
              <p className="text-sm text-slate-500 mt-1 uppercase font-bold">A.N. AZKA OUTDOOR MALANG</p>
            </div>

            <div className={`relative border-2 border-dashed rounded-[24px] transition-all flex flex-col items-center justify-center p-8 min-h-[200px] ${preview ? "border-indigo-200 bg-indigo-50/30" : "border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-slate-100"}`}>
              <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} accept="image/*" disabled={isExpired} />
              {!preview ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-2xl shadow-sm mx-auto w-fit mb-4 text-slate-400"><Upload size={32} /></div>
                  <p className="text-sm font-bold text-slate-900">Klik untuk upload bukti</p>
                </div>
              ) : (
                <div className="w-full">
                  <img src={preview} alt="Preview" className="w-full aspect-video object-contain rounded-xl" />
                  <button onClick={() => {setFile(null); setPreview(null);}} className="mt-4 text-xs font-bold text-red-500 w-full">Ganti Foto</button>
                </div>
              )}
            </div>

            <button 
              disabled={!file || uploading || loading || error || isExpired} 
              onClick={handleSubmit}
              className={`w-full mt-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${!file || uploading || isExpired ? "bg-slate-100 text-slate-400" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
              {isExpired ? "Pembayaran Expired" : "Konfirmasi Pembayaran"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}