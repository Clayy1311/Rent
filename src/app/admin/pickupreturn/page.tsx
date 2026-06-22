"use client";

import { useEffect, useState } from "react";
import {
  History,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Eye,
  Search,
  Calendar,
  Tag,
  X,
} from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { cn } from "../../../../lib/utils";

export default function BookingActionPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState("");
  const [debounceSearch, setDebounceSearch] = useState("");

  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [penaltyData, setPenaltyData] = useState<{
    show: boolean;
    amount: number;
    code: string;
    lateDays: number;
    isLate: boolean;
  } | null>(null);

  // debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceSearch(search);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  // fetch ONLY RETURN data
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await api.get(
          `/admin/allBookings?status=RENTED&search=${debounceSearch}`,
        );
        setBookings(res.data.bookings || []);
        console.log(res);
      } catch (err) {
        toast.error("Gagal mengambil data booking");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [refreshKey, debounceSearch]);

  // ONLY RETURN ACTION
  const handleReturn = async (id: number) => {
    if (!confirm(`Konfirmasi return untuk ID #${id}?`)) return;

    try {
      const res = await api.patch(`/admin/bookings/${id}/return`);

      const penalty =
        res.data.data?.booking?.penaltyAmount ||
        res.data.data?.autoPenalty ||
        0;

      const bCode = res.data.data?.booking?.bookingCode || `ID #${id}`;

      const lateDays = res.data.data?.booking?.lateDays;

      const isLate = res.data.data?.isLate ?? penalty > 0;

      setPenaltyData({
        show: true,
        amount: penalty,
        code: bCode,
        isLate,
        lateDays, // 🔥 INI WAJIB
      });

      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      toast.error("Gagal memproses return");
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase italic tracking-tight text-slate-950">
            Operasional <span className="text-blue-600">Return</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            Proses pengembalian dan pengecekan denda unit alat.
          </p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="CARI NAMA / KODE BOOKING..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full outline-none text-xs font-bold uppercase tracking-wider text-slate-800"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="h-[300px] flex items-center justify-center">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b">
                <tr>
                  <th className="px-8 py-5">Penyewa / Kode</th>
                  <th className="px-8 py-5">Jadwal</th>
                  <th className="px-8 py-5">Item</th>
                  <th className="px-8 py-5">Total</th>
                  <th className="px-8 py-5 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {bookings.length > 0 ? (
                  bookings.map((booking: any) => {
                    const now = new Date();
                    const endDate = new Date(booking.endDate);

                    // biar sampai akhir hari
                    endDate.setHours(23, 59, 59, 999);

                    // selisih waktu
                    const diffTime = now.getTime() - endDate.getTime();
                    const lateDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );

                    const isLate = lateDays > 0;
                    const isWarning = lateDays > 0 && lateDays <= 2;
                    const isDanger = lateDays >= 3;
                    return (
                      <tr
                        key={booking.id}
                        className="hover:bg-slate-50 transition-all"
                      >
                        {/* USER */}
                        <td className="px-6 py-5">
                          <div className="font-black uppercase text-slate-800">
                            {booking.user?.name}
                          </div>
                          <div className="text-[11px] text-blue-600 font-mono">
                            #{booking.bookingCode}
                          </div>
                        </td>

                        {/* SCHEDULE */}
                        <td className="px-6 py-5 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(booking.startDate).toLocaleDateString(
                              "id-ID",
                            )}{" "}
                            -{" "}
                            {new Date(booking.endDate).toLocaleDateString(
                              "id-ID",
                            )}
                          </div>

                          {/* 🔥 STATUS BADGE */}
                          <div className="mt-2">
                            {lateDays <= 0 ? (
                              <span className="px-2 py-1 text-[10px] font-black rounded-lg bg-green-100 text-green-600">
                                ON TIME
                              </span>
                            ) : isWarning ? (
                              <span className="px-2 py-1 text-[10px] font-black rounded-lg bg-yellow-100 text-yellow-600">
                                TERLAMBAT {lateDays} HARI (WARNING)
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-[10px] font-black rounded-lg bg-red-100 text-red-600">
                                TERLAMBAT {lateDays} HARI (DANGER)
                              </span>
                            )}
                          </div>
                        </td>

                        {/* ITEMS */}
                        {/* ITEMS */}
                        <td className="px-6 py-5">
                          <button
                            onClick={() =>
                              setSelectedBooking(booking)
                            } /* 🔥 Sekarang mengoper seluruh object booking */
                            className="flex items-center gap-1 text-[11px] font-black uppercase bg-slate-100 px-3 py-2 rounded-xl hover:bg-slate-200 transition"
                          >
                            <Eye size={14} />
                            Detail
                          </button>
                        </td>

                        {/* TOTAL */}
                        <td className="px-6 py-5 font-black text-slate-800 text-right">
                          Rp {booking.totalPrice?.toLocaleString("id-ID")}
                        </td>

                        {/* ACTION */}
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => handleReturn(booking.id)}
                            className="bg-slate-950 hover:bg-slate-800 text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase transition"
                          >
                            Proses Return
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-20 text-slate-400"
                    >
                      Tidak ada data booking
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL ITEM */}
      {/* MODAL ITEM */}
      {selectedBooking && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in">
          {/* 1. BACKDROP OVERLAY DENGAN BLUR (GLASSMORPHISM) */}
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all"
            onClick={() => setSelectedBooking(null)}
          />

          {/* 2. MAIN MODAL CONTAINER */}
          <div className="bg-white p-6 rounded-[32px] z-10 w-full max-w-md shadow-2xl border border-slate-100 flex flex-col gap-4 relative overflow-hidden">
            {/* HEADER MODAL */}
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  Detail Pelanggan & Item
                </span>
                <h2 className="font-black text-xl uppercase tracking-wide text-slate-950 italic">
                  Daftar Item ({(selectedBooking.items || []).length})
                </h2>
              </div>

              {/* Tombol Close Lingkaran Minimalis */}
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-950 hover:bg-slate-50 rounded-xl transition-all border border-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 🔥 TAMPILKAN NAMA OFFLINE CUSTOMER DI SINI (DI ATAS LIST ITEM AGAR LEBIH RAPI) */}
            {selectedBooking.offlineCustomer && (
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-2xl">
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                  Penyewa Offline (Walk-in)
                </p>
                <p className="text-sm font-black text-slate-800 uppercase">
                  {selectedBooking.offlineCustomer.name}
                </p>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedBooking.offlineCustomer.phoneNumber}
                </p>
              </div>
            )}

            {/* 3. LIST ITEMS AREA */}
            <div className="flex flex-col gap-2 max-h-[45vh] overflow-y-auto pr-1 scrollbar-thin">
              {(selectedBooking.items || []).map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-3 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                >
                  {/* Bagian Kiri: Info Nama Alat */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                      <img
                        src={`http://localhost:3001/uploads/${item.item?.image}`}
                        alt={item.item?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-bold text-sm text-slate-800 group-hover:text-slate-950 transition-colors">
                        {item.item?.name || "Item Tidak Diketahui"}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Qty tersedia di detail
                      </span>
                    </div>
                  </div>

                  {/* Bagian Kanan: Badge Kuantitas / Qty */}
                  <span className="text-xs font-black px-3 py-1.5 bg-white text-slate-950 border border-slate-200 rounded-xl shadow-sm tracking-wider">
                    {item.quantity} PCS
                  </span>
                </div>
              ))}
            </div>

            {/* FOOTER MODAL */}
            <div className="mt-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full h-11 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-md shadow-slate-950/10"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PENALTY MODAL */}
      {penaltyData?.show && (
        <div className="fixed inset-0 flex items-center justify-center">
          {/* BACKDROP */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPenaltyData(null)}
          />

          {/* MODAL */}
          <div className="bg-white p-6 rounded-2xl z-10 text-center space-y-4 w-[300px] shadow-xl">
            {penaltyData.isLate ? (
              <>
                <AlertCircle className="mx-auto text-red-500" />

                <h3 className="font-black text-red-600 text-lg">Terlambat!</h3>

                <p className="text-sm text-slate-600">
                  Kode: <span className="font-bold">{penaltyData.code}</span>
                </p>

                {/* 🔥 TAMBAHAN: LATE DAYS */}
                <p className="text-sm text-slate-600">
                  Terlambat:{" "}
                  <span className="font-black text-red-600">
                    {penaltyData.lateDays} hari
                  </span>
                </p>

                <p className="font-black text-xl text-red-600">
                  Rp {penaltyData.amount.toLocaleString("id-ID")}
                </p>
              </>
            ) : (
              <>
                <CheckCircle2 className="mx-auto text-green-500" />

                <h3 className="font-black text-green-600 text-lg">Aman</h3>

                <p className="text-sm text-slate-600">
                  Kode: <span className="font-bold">{penaltyData.code}</span>
                </p>
              </>
            )}

            {/* BUTTON */}
            <button
              onClick={() => setPenaltyData(null)}
              className="bg-black text-white px-4 py-2 rounded-xl w-full hover:bg-black/80 transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
