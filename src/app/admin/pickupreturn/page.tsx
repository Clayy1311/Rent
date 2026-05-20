"use client";

import { useEffect, useState } from "react";
import {
  PackageCheck,
  History,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Search,
  Calendar,
  DollarSign,
  Tag,
  X
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
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  // MODAL ITEM
  const [selectedItems, setSelectedItems] = useState<any[] | null>(null);

  // MODAL DENDA
  const [penaltyData, setPenaltyData] = useState<{
    show: boolean;
    amount: number;
    code: string;
    isLate: boolean;
  } | null>(null);

  // EFFECT PERTAMA: Mengurusi Debounce pada Input Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // EFFECT KEDUA: Hit API jika Tab berubah, data di-refresh, atau hasil Debounce Search berubah
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/allBookings?status=${activeTab}&search=${debounceSearch}`);
        setBookings(res.data.bookings || []);
      } catch (err) {
        toast.error("Gagal mengambil data booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [activeTab, refreshKey, debounceSearch]);

  const handleAction = async (id: number, currentStatus: BookingStatus) => {
    const isPickup = currentStatus === "CONFIRMED";

    if (!confirm(`Konfirmasi untuk ID #${id}?`)) return;

    try {
      const endpoint = isPickup
        ? `/admin/bookings/${id}/pickup`
        : `/admin/bookings/${id}/return`;

      const res = await api.patch(endpoint);

      const penalty =
        res.data.data?.booking?.penaltyAmount ||
        res.data.data?.autoPenalty ||
        0;

      const bCode = res.data.data?.booking?.bookingCode || `ID #${id}`;

      if (!isPickup) {
        setPenaltyData({
          show: true,
          amount: penalty,
          code: bCode,
          isLate: penalty > 0,
        });
      } else {
        toast.success("Pickup berhasil!");
      }

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error("Gagal memproses");
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight text-slate-950">
            Operasional{" "}
            <span className="text-blue-600">
              {activeTab === "CONFIRMED" ? "Pickup" : "Return"}
            </span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            {activeTab === "CONFIRMED" 
              ? "Proses penyerahan alat outdoor kepada pelanggan." 
              : "Proses pengembalian dan pengecekan denda unit alat."}
          </p>
        </div>

        {/* TABS CONTROLLER */}
        <div className="flex p-1.5 bg-slate-100 w-fit rounded-2xl border border-slate-200/40 self-start sm:self-auto">
          <TabButton
            active={activeTab === "CONFIRMED"}
            onClick={() => setActiveTab("CONFIRMED")}
            icon={<PackageCheck size={14} />}
            label="Pickup"
          />
          <TabButton
            active={activeTab === "RENTED"}
            onClick={() => setActiveTab("RENTED")}
            icon={<History size={14} />}
            label="Return"
          />
        </div>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 group focus-within:border-blue-600/50 transition-all">
        <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          type="text"
          placeholder="CARI NAMA / KODE BOOKING UNIT..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300"
        />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">Penyewa / Kode</th>
                  <th className="px-8 py-5">Jadwal Rental</th>
                  <th className="px-8 py-5">Item Unit</th>
                  <th className="px-8 py-5">Total Bayar</th>
                  <th className="px-8 py-5 text-center">Aksi Operasional</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50">
                {bookings.length > 0 ? (
                  bookings.map((booking: any) => (
                    <tr key={booking.id} className="group hover:bg-slate-50/50 transition-colors">
                      {/* USER & CODE */}
                      <td className="px-8 py-5">
                        <div className="space-y-1">
                          <div className="font-black text-slate-900 uppercase italic tracking-tighter text-base">
                            {booking.user?.name}
                          </div>
                          <div className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded w-fit border border-blue-100/50">
                            #{booking.bookingCode}
                          </div>
                        </div>
                      </td>

                      {/* SCHEDULE */}
                      <td className="px-8 py-5 font-medium text-slate-600">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <Calendar size={14} className="text-slate-300" />
                          <span>
                            {new Date(booking.startDate).toLocaleDateString("id-ID")} -{" "}
                            {new Date(booking.endDate).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </td>

                      {/* ITEM LINK BUTTON */}
                      <td className="px-8 py-5">
                        <button
                          onClick={() => setSelectedItems(booking.items || [])}
                          className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-black uppercase italic tracking-wider transition-all shadow-sm"
                        >
                          <Eye size={14} />
                          Detail Item
                        </button>
                      </td>

                      {/* TOTAL PRICE */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-1 text-slate-900 font-mono font-black text-base">
                          <span className="text-xs text-slate-400 font-normal">Rp</span>
                          {booking.totalPrice?.toLocaleString("id-ID")}
                        </div>
                      </td>

                      {/* ACTION CONTROLLER */}
                      <td className="px-8 py-5">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleAction(booking.id, activeTab)}
                            className="bg-slate-950 hover:bg-blue-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-md"
                          >
                            {activeTab === "CONFIRMED" ? "Proses Pickup" : "Proses Return"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* EMPTY STATE MATCH */
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                      <PackageCheck className="mx-auto mb-3 opacity-20" size={40} />
                      Tidak ada antrean data operasional.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DETAIL ITEM */}
      {selectedItems && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedItems(null)}
          />

          <div className="bg-white rounded-[40px] border border-slate-100 p-8 w-full max-w-md z-10 shadow-2xl relative space-y-6 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setSelectedItems(null)}
              className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
            >
              <X size={16} />
            </button>

            <div>
              <h2 className="text-2xl font-black uppercase italic text-slate-950 tracking-tight">
                Daftar <span className="text-blue-600">Unit Sewa</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium italic mt-0.5">Daftar item alat perlengkapan yang diambil.</p>
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1">
              {selectedItems.length === 0 ? (
                <p className="text-sm font-bold text-center py-6 text-slate-400 italic uppercase">Tidak ada item unit</p>
              ) : (
                selectedItems.map((item: any, i: number) => (
                  <div key={i} className="group flex items-center justify-between border border-slate-100 bg-slate-50/50 p-4 rounded-2xl hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Tag size={14} />
                      </div>
                      <p className="font-black text-slate-900 uppercase italic tracking-tight text-sm">
                        {item.item?.name}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-black bg-slate-950 text-white px-2.5 py-1 rounded-lg">
                      QTY: {item.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setSelectedItems(null)}
              className="w-full bg-slate-950 hover:bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl"
            >
              Selesai Cek
            </button>
          </div>
        </div>
      )}

      {/* MODAL DENDA PENGEMBALIAN */}
      {penaltyData?.show && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

          <div className="bg-white p-8 rounded-[40px] border border-slate-100 text-center max-w-sm w-full z-10 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            {penaltyData.isLate ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 border border-red-100">
                  <AlertCircle size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic text-red-600 tracking-tight">Terlambat Kembali!</h3>
                  <p className="text-xs font-mono font-bold text-slate-400">KODE: {penaltyData.code}</p>
                </div>
                <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 font-mono font-black text-2xl text-red-700 flex items-center justify-center gap-1">
                  <span className="text-xs font-normal text-red-400">Rp</span>
                  {penaltyData.amount.toLocaleString("id-ID")}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-500 border border-green-100">
                  <CheckCircle2 size={32} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black uppercase italic text-green-600 tracking-tight">Aman Bersih!</h3>
                  <p className="text-xs font-mono font-bold text-slate-400">KODE: {penaltyData.code}</p>
                </div>
                <p className="text-xs font-bold uppercase italic text-slate-500 bg-slate-50 py-3 rounded-2xl border border-slate-100">
                  Unit kembali tepat waktu & tanpa denda.
                </p>
              </div>
            )}

            <button
              onClick={() => setPenaltyData(null)}
              className="w-full bg-slate-950 hover:bg-blue-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// SUB-KOMPONEN TAB BUTTON
function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: any;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black uppercase italic transition-all duration-200",
        active
          ? "bg-white text-slate-950 shadow-md ring-1 ring-slate-200/50"
          : "text-slate-400 hover:text-slate-600",
      )}
    >
      {icon} {label}
    </button>
  );
}