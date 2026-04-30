"use client";

import { useEffect, useState } from "react";
import { 
  ClipboardCheck, 
  PackageCheck, 
  History, 
  Loader2, 
  ArrowRightLeft,
  Calendar,
  Hash,
  AlertCircle,
  X,
  CheckCircle2
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

type BookingStatus = "CONFIRMED" | "RENTED";

export default function BookingActionPage() {
  const [activeTab, setActiveTab] = useState<BookingStatus>("CONFIRMED");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // State untuk menampung info denda setelah klik return
  const [penaltyData, setPenaltyData] = useState<{
    show: boolean;
    amount: number;
    code: string;
    isLate: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/allBookings?status=${activeTab}`);
        setBookings(res.data.bookings || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Gagal mengambil data booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [activeTab, refreshKey]);

  const handleAction = async (id: number, currentStatus: BookingStatus) => {
    const isPickup = currentStatus === "CONFIRMED";
    const actionLabel = isPickup ? "Pickup" : "Pengembalian";
    
    if (!confirm(`Konfirmasi ${actionLabel} untuk ID #${id}?`)) return;

    try {
      const endpoint = isPickup 
        ? `/admin/bookings/${id}/pickup` 
        : `/admin/bookings/${id}/return`;

      const res = await api.patch(endpoint);
      
      // Ambil data denda dari response body yang kamu kasih tadi
      // Kita cek penaltyAmount dari objek booking atau autoPenalty
      const penalty = res.data.data?.booking?.penaltyAmount || res.data.data?.autoPenalty || 0;
      const bCode = res.data.data?.booking?.bookingCode || `ID #${id}`;

      if (!isPickup) {
        // Tampilkan Modal informasi (baik denda 0 maupun ada denda)
        setPenaltyData({
          show: true,
          amount: penalty,
          code: bCode,
          isLate: penalty > 0
        });
      } else {
        toast.success("Proses Pickup Berhasil!");
      }

      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error("Action Error:", err);
      toast.error(`Gagal memproses ${actionLabel}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER */}
      <div>
        <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
          Operasional <span className="text-blue-600">{activeTab === "CONFIRMED" ? "Pickup" : "Return"}</span>
        </h1>
        <p className="text-slate-500 font-medium italic">Manajemen serah terima unit Azka Outdoor.</p>
      </div>

      {/* TABS */}
      <div className="flex p-1 bg-slate-100 w-fit rounded-[24px] border border-slate-200/50">
        <TabButton 
          active={activeTab === "CONFIRMED"} 
          onClick={() => setActiveTab("CONFIRMED")} 
          icon={<PackageCheck size={16}/>} 
          label="Pickup" 
        />
        <TabButton 
          active={activeTab === "RENTED"} 
          onClick={() => setActiveTab("RENTED")} 
          icon={<History size={16}/>} 
          label="Return" 
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-6">Penyewa</th>
                  <th className="px-8 py-6">Jadwal</th>
                  <th className="px-8 py-6">Total Bayar</th>
                  <th className="px-8 py-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 uppercase italic leading-none">{booking.user?.name}</p>
                      <span className="text-[10px] font-bold text-blue-600">{booking.bookingCode}</span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-600 text-xs italic">
                      {new Date(booking.startDate).toLocaleDateString('id-ID')} - {new Date(booking.endDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900 italic">
                      Rp {booking.totalPrice?.toLocaleString('id-ID')}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <button 
                        onClick={() => handleAction(booking.id, activeTab)}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all active:scale-95",
                          activeTab === "CONFIRMED" ? "bg-slate-950 text-white" : "bg-blue-600 text-white"
                        )}
                      >
                        {activeTab === "CONFIRMED" ? "Selesaikan Pickup" : "Selesaikan Return"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP INFORMASI DENDA / BERHASIL */}
      {penaltyData?.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPenaltyData(null)} />
          <div className="bg-white rounded-[40px] w-full max-w-sm overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
            <div className="p-10 text-center">
              {penaltyData.isLate ? (
                <>
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Terdeteksi Denda!</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-6 tracking-widest">{penaltyData.code}</p>
                  <div className="bg-red-50 border border-red-100 rounded-3xl p-6 mb-8">
                    <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1">Total Denda Terlambat</p>
                    <p className="text-4xl font-black text-red-600 italic leading-none">Rp {penaltyData.amount.toLocaleString('id-ID')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase italic tracking-tighter">Tepat Waktu!</h2>
                  <p className="text-slate-400 text-[10px] font-bold uppercase mb-6 tracking-widest">{penaltyData.code}</p>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 mb-8">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Status Pengembalian</p>
                    <p className="text-2xl font-black text-emerald-600 italic tracking-tighter uppercase">Bersih / No Denda</p>
                  </div>
                </>
              )}

              <button 
                onClick={() => setPenaltyData(null)}
                className="w-full bg-slate-950 text-white py-4 rounded-2xl font-black uppercase italic text-xs tracking-widest hover:bg-blue-600 transition-colors"
              >
                Tutup & Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-[20px] text-[10px] font-black uppercase italic transition-all",
        active ? "bg-white text-slate-950 shadow-md" : "text-slate-400 hover:text-slate-600"
      )}
    >
      {icon} {label}
    </button>
  );
}