"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useBookings } from "@/hooks/useBooking";
import { 
  Eye, 
  Loader2, 
  Search, 
  RefreshCcw, 
  ChevronLeft, 
  ChevronRight,
  ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import { DetailBookingModal } from "@/components/admin/DetailBookingModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminAllBookingsPage() {
  const { data, loading, meta, handleSearch, handleStatusFilter, handlePageChange, filters, refresh } = useBookings();
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER: Bold, Italic, Uppercase */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Semua <span className="text-blue-600">Pesanan</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            Database seluruh transaksi penyewaan Azka Outdoor.
          </p>
        </div>
        <button 
          onClick={refresh}
          className="p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all text-slate-600"
          title="Refresh Data"
        >
          <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* FILTER BAR: Seirama dengan input style */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Cari Kode Booking atau Nama..." 
            className="pl-11 py-6 rounded-[20px] border-slate-100 bg-white text-slate-950 font-bold placeholder:text-slate-400 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full md:w-[240px] py-6 rounded-[20px] border-slate-100 text-slate-950 font-black uppercase italic text-[10px] bg-white shadow-sm tracking-widest">
            <SelectValue placeholder="FILTER STATUS" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl font-bold uppercase text-[10px] tracking-widest">
            <SelectItem value="ALL">SEMUA STATUS</SelectItem>
            <SelectItem value="WAITING_CONFIRMATION">WAITING CONFIRMATION</SelectItem>
            <SelectItem value="PAID">PAID</SelectItem>
            <SelectItem value="PICKED_UP">PICKED UP</SelectItem>
            <SelectItem value="RETURNED">RETURNED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE: Rounded [40px] */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-8 py-5">Pelanggan</th>
                <th className="px-8 py-5">Invoice</th>
                <th className="px-8 py-5 text-center">Status</th>
                <th className="px-8 py-5">Total Harga</th>
                <th className="px-8 py-5 text-center">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-blue-600 mb-2" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">Sinkronisasi Data...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase text-xs tracking-widest">
                    Data tidak ditemukan
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="font-black text-slate-900 uppercase tracking-tighter">{item.user?.name}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{item.user?.email}</div>
                    </td>
                    <td className="px-8 py-6 font-mono text-xs font-bold text-blue-600 italic">
                      #{item.bookingCode}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter border ${
                        item.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        item.status === 'WAITING_CONFIRMATION' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-950 text-base">
                      Rp {item.totalPrice?.toLocaleString("id-ID")}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleViewDetail(item.id)}
                          disabled={detailLoading}
                          className="p-3 bg-white border border-slate-100 hover:border-blue-600 text-slate-400 hover:text-blue-600 rounded-2xl transition-all shadow-sm"
                        >
                          {detailLoading ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
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

      {/* PAGINATION: Identik dengan gaya admin-mu */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
          Total Data: <span className="text-slate-950">{meta.totalData}</span>
        </p>
        <div className="flex items-center gap-3">
          <button 
            disabled={filters.page === 1} 
            onClick={() => handlePageChange(filters.page - 1)}
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-950 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="bg-slate-950 text-white h-11 px-6 rounded-xl flex items-center justify-center font-black text-[10px] italic tracking-tighter uppercase">
            Halaman {meta.currentPage} / {meta.totalPages}
          </div>

          <button 
            disabled={filters.page === meta.totalPages} 
            onClick={() => handlePageChange(filters.page + 1)}
            className="h-11 w-11 flex items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-950 disabled:opacity-30 transition-all shadow-sm"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Modal Detail */}
      <DetailBookingModal 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        data={detailData}
      />
    </div>
  );
}