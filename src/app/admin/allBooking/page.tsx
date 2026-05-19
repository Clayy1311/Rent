"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useBookings } from "@/hooks/useBooking";
import { downloadReport } from "@/service/reportService";
import { 
  Eye, 
  Loader2, 
  Search, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  Download,
  Calendar as CalendarIcon
} from "lucide-react";
import { toast } from "sonner";
import { DetailBookingModal } from "@/components/admin/DetailBookingModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "../../../../lib/utils";

export default function AdminAllBookingsPage() {
  const { data, loading, meta, handleSearch, handleStatusFilter, handlePageChange, filters, refresh } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");

  // State untuk Report
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [downloadLoading, setDownloadLoading] = useState(false);

  // State untuk Modal Detail
  const [detailData, setDetailData] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  // Debounce Search otomatis
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleViewDetail = async (id: number) => {
    try {
      setDetailLoading(true);
      const res = await api.get(`/admin/booking/getDetail/${id}`);
      setDetailData(res.data.data);
      setIsDetailOpen(true);
    } catch (err) {
      toast.error("Gagal mengambil detail pesanan");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!dateRange.from || !dateRange.to) {
      return toast.error("Pilih rentang tanggal report lebih dulu!");
    }
    try {
      setDownloadLoading(true);
      await downloadReport(dateRange.from, dateRange.to);
      toast.success("Report berhasil diunduh!");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh report. Cek koneksi atau server.");
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      {/* HEADER & REPORT CONTROL */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Semua <span className="text-blue-600">Pesanan</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            Database seluruh transaksi penyewaan Azka Outdoor.
          </p>
        </div>

        {/* CUSTOM REPORT DOWNLOADER */}
        
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cari Kode Booking atau Nama..." 
            className="pl-11 py-7 rounded-[24px] border-slate-100 bg-white text-slate-950 font-bold placeholder:text-slate-400 shadow-sm focus:ring-2 focus:ring-blue-600/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full md:w-[260px] py-7 rounded-[24px] border-slate-100 text-slate-950 font-black uppercase italic text-[10px] bg-white shadow-sm tracking-widest">
            <SelectValue placeholder="FILTER STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl font-bold uppercase text-[10px] tracking-widest border-slate-100 shadow-xl">
            <SelectItem value="ALL">SEMUA STATUS</SelectItem>
            <SelectItem value="WAITING_CONFIRMATION">WAITING CONFIRMATION</SelectItem>
            <SelectItem value="PAID">PAID</SelectItem>
            <SelectItem value="PICKED_UP">PICKED UP</SelectItem>
            <SelectItem value="RETURNED">RETURNED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-100 rounded-[45px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
              <tr>
                <th className="px-10 py-7">Pelanggan</th>
                <th className="px-10 py-7">Invoice</th>
                <th className="px-10 py-7 text-center">Status</th>
                <th className="px-10 py-7">Total Harga</th>
                <th className="px-10 py-7 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-blue-600" size={40} />
                      <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">Sinkronisasi Database...</p>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-32 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest opacity-40">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="px-10 py-7">
                      <div className="font-black text-slate-900 uppercase italic tracking-tighter text-base leading-tight">{item.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tighter">{item.user?.email}</div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex items-center gap-2 font-mono text-xs font-black text-blue-600 bg-blue-50 w-fit px-3 py-1 rounded-lg italic">
                        #{item.bookingCode}
                      </div>
                    </td>
                    <td className="px-10 py-7 text-center">
                      <span className={cn(
                        "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic",
                        item.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'WAITING_CONFIRMATION' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      )}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-10 py-7">
                      <div className="font-black text-slate-950 text-lg italic tracking-tighter">
                        Rp {item.totalPrice?.toLocaleString("id-ID")}
                      </div>
                    </td>
                    <td className="px-10 py-7">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleViewDetail(item.id)}
                          disabled={detailLoading}
                          className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 hover:border-blue-600 text-slate-900 hover:text-blue-600 rounded-2xl transition-all shadow-sm active:scale-90 font-black text-[9px] uppercase italic tracking-widest"
                        >
                          {detailLoading ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                          Detail
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

      {/* PAGINATION */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 px-4">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] italic">
          Data Azka Outdoor: <span className="text-slate-950 underline">{meta.totalData} Terdeteksi</span>
        </p>
        <div className="flex items-center gap-4">
          <button 
            disabled={filters.page === 1} 
            onClick={() => handlePageChange(filters.page - 1)}
            className="h-14 w-14 flex items-center justify-center rounded-[20px] border border-slate-100 bg-white text-slate-950 disabled:opacity-30 transition-all shadow-sm hover:bg-slate-50 active:scale-90"
          >
            <ChevronLeft size={22} />
          </button>
          
          <div className="bg-slate-950 text-white h-14 px-8 rounded-[20px] flex items-center justify-center font-black text-[11px] italic tracking-widest uppercase shadow-xl">
            {meta.currentPage} <span className="mx-2 text-slate-500">/</span> {meta.totalPages}
          </div>

          <button 
            disabled={filters.page === meta.totalPages} 
            onClick={() => handlePageChange(filters.page + 1)}
            className="h-14 w-14 flex items-center justify-center rounded-[20px] border border-slate-100 bg-white text-slate-950 disabled:opacity-30 transition-all shadow-sm hover:bg-slate-50 active:scale-90"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      {/* MODAL DETAIL */}
      <DetailBookingModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}