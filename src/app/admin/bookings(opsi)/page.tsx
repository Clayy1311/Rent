"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Check, Eye, ImageIcon, Loader2, Search, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfirmBookingModal } from "@/components/admin/ConfirmBookingModal";
import { DetailBookingModal } from "@/components/admin/DetailBookingModal";

export default function WaitingConfirmationPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State untuk Modal Konfirmasi
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // State untuk Modal Detail
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/allBookings?status=WAITING_CONFIRMATION");
      setBookings(res.data.bookings || []);
    } catch (err) {
      toast.error("Gagal mengambil data pesanan");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const res = await api.get(`/admin/booking/getDetail/${id}`);
      setDetailData(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error("Gagal mengambil detail pesanan");
    }
  };

const handleConfirm = async () => {
  // CRITICAL: Menggunakan ID Booking (selectedBooking.id) bukan ID Payment
  if (!selectedBooking?.id) {
    toast.error("ID Booking tidak ditemukan");
    return;
  }

  setConfirmLoading(true);
  try {
    // Menembak endpoint http://localhost:3001/payments/:id_booking
    await api.post(`/payments/${selectedBooking.id}/verify`, {
      status: "SUCCESS" // Sesuaikan string status ini dengan kebutuhan backend-mu
    });

    toast.success(`Booking #${selectedBooking.bookingCode} berhasil dikonfirmasi!`);
    setIsConfirmOpen(false);
    fetchBookings(); // Refresh list data
  } catch (err: any) {
    console.error("Confirm Error:", err);
    toast.error(err.response?.data?.message || "Gagal verifikasi pesanan");
  } finally {
    setConfirmLoading(false);
  }
};

  useEffect(() => {
    fetchBookings();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Konfirmasi Pesanan
          </h1>
          <p className="text-slate-500 font-medium italic">
            Daftar pelanggan yang menunggu validasi pembayaran Azka Outdoor.
          </p>
        </div>
        <button 
          onClick={fetchBookings}
          className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-600"
          title="Refresh Data"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5">Invoice</th>
                <th className="px-8 py-5">Total Pembayaran</th>
                <th className="px-8 py-5">Bukti</th>
                <th className="px-8 py-5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-primary mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Menghubungkan ke server...</p>
                  </td>
                </tr>
              ) : (bookings?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Check size={32} />
                    </div>
                    <p className="text-slate-400 font-bold uppercase text-xs">Semua pesanan sudah terkonfirmasi</p>
                  </td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 uppercase tracking-tighter">{item.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.user?.email}</div>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs font-bold text-primary italic">
                      #{item.bookingCode}
                    </td>
                    <td className="px-8 py-6 font-black text-slate-950 text-base">
                      Rp {item.totalPrice?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-8 py-6">
                      {item.payment?.paymentProof ? (
                        <a 
                          href={`http://localhost:3001/${item.payment.paymentProof.replace(/\\/g, '/')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 bg-slate-100 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg text-slate-600 transition-all font-bold text-[10px] uppercase"
                        >
                          <ImageIcon size={14} /> Lihat Foto
                        </a>
                      ) : (
                        <span className="text-slate-300 text-[10px] font-bold italic">Tanpa Bukti</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center gap-3">
                        <button 
                          onClick={() => handleViewDetail(item.id)}
                          className="p-3 bg-white border border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-900 rounded-2xl transition-all shadow-sm"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedBooking(item);
                            setIsConfirmOpen(true);
                          }}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Check size={16} /> Konfirmasi
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail */}
      <DetailBookingModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />

      {/* Modal Konfirmasi */}
      <ConfirmBookingModal 
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        loading={confirmLoading}
        bookingCode={selectedBooking?.bookingCode || ""}
      />
    </div>
  );
}