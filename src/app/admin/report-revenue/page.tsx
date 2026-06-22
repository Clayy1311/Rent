"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import TestApiPage from "@/components/admin/TestApi";
interface Transaction {
  bookingCode: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  penaltyAmount: number;

  payment?: {
    paymentProof: string;
    status: string;
    amount: number;
  };

  user: {
    name: string;
  };

  offlineCustomer :{
    name: string;
  }
}

export default function TransactionTable() {
const [transactions, setTransactions] = useState<Transaction[]>([]);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

const limit = 10;

useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await api.get(
        `/admin/transaction?page=${page}&limit=${limit}&search=${debouncedSearch}`
      );

      setTransactions(res.data.data.data);
      setTotalPages(res.data.data.meta.totalPages);
    } catch (err) {
      console.log(err);
      setTransactions([]);
    }
  };

  fetchData();
}, [page, debouncedSearch]);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1); // 🔥 penting: reset page kalau search berubah
  }, 400);

  return () => clearTimeout(timer);
}, [search]);
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  const handlePageChange = (newPage: number) => {
  if (newPage < 1) return;
  if (newPage > totalPages) return;

  setPage(newPage);
};

  const formatCurrency = (value: number) => {
    return value.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
    });
  };

 return (
  <div className="space-y-6">
    {/* Header */}
    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        Laporan Pendapatan
      </h1>
      <p className="text-slate-500 mt-1">
        Download laporan berdasarkan periode dan lihat riwayat transaksi yang telah selesai.
      </p>
    </div>

    {/* Download Card */}
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-800 mb-1">
        Download Laporan Pendapatan
      </h2>

      <p className="text-sm text-slate-500 mb-4">
        Export laporan berdasarkan hari ini, minggu ini, bulan ini, tahun ini,
        atau rentang tanggal tertentu.
      </p>

      <TestApiPage />
    </div>

    {/* Table */}
  <div className="w-full bg-white border border-slate-100 rounded-[45px] overflow-hidden shadow-sm">
  
  {/* SEARCH SECTION */}
  <div className="flex justify-between items-center px-6 md:px-10 py-6 border-b border-slate-50/80">
    <input
      type="text"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Cari kode booking atau nama user..."
      className="w-full max-w-md px-5 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-blue-500"
    />
  </div>

  {/* TABLE SECTION - Menggunakan w-full table-fixed atau auto yang responsif */}
  <div className="w-full overflow-x-auto xl:overflow-x-visible">
    <table className="w-full text-left text-sm border-collapse table-auto">
      
      {/* HEADER - Padding px diubah menjadi px-4 agar muat, md:px-6 di layar besar */}
      <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
        <tr>
          <th className="px-4 md:px-6 py-7">Kode</th>
          <th className="px-4 md:px-6 py-7">Customer</th>
          <th className="px-4 md:px-6 py-7">Periode Sewa</th>
          <th className="px-4 md:px-6 py-7 text-right">Total</th>
          <th className="px-4 md:px-6 py-7 text-right">Denda</th>
          <th className="px-4 md:px-6 py-7 text-center">Payment</th>
          <th className="px-4 md:px-6 py-7 text-right">Total Akhir</th>
        </tr>
      </thead>

      {/* BODY */}
      <tbody className="divide-y divide-slate-50">
        {transactions.length === 0 ? (
          <tr>
            <td colSpan={7} className="p-32 text-center text-slate-300 font-black uppercase italic text-xs tracking-widest opacity-40">
              Data tidak ditemukan
            </td>
          </tr>
        ) : (
          transactions.map((item, index) => {
            const finalTotal = item.totalPrice + item.penaltyAmount;

            return (
              <tr key={index} className="hover:bg-slate-50/80 transition-all group">
                
                {/* BOOKING CODE */}
                <td className="px-4 md:px-6 py-6 whitespace-nowrap">
                  <div className="flex items-center gap-2 font-mono text-[11px] font-black text-blue-600 bg-blue-50 w-fit px-2.5 py-1 rounded-lg italic">
                    #{item.bookingCode}
                  </div>
                </td>

                {/* CUSTOMER */}
                <td className="px-4 md:px-6 py-6">
                  {/* Membatasi teks agar tidak merusak lebar tabel jika namanya terlalu panjang */}
                  <div className="font-black text-slate-900 uppercase italic tracking-tighter text-xs md:text-sm leading-tight max-w-[120px] md:max-w-none truncate md:whitespace-normal">
                   {item.offlineCustomer?.name || item.user?.name || "Pelanggan Tanpa Nama"}
                  </div>
                </td>

                {/* DATE */}
                <td className="px-4 md:px-6 py-6 text-slate-500 text-[11px] font-bold uppercase tracking-tight whitespace-nowrap">
                  {formatDate(item.startDate)} - {formatDate(item.endDate)}
                </td>

                {/* TOTAL */}
                <td className="px-4 md:px-6 py-6 text-right whitespace-nowrap">
                  <div className="font-black text-slate-600 text-xs italic tracking-tighter">
                    {formatCurrency(item.totalPrice)}
                  </div>
                </td>

                {/* DENDA */}
                <td className="px-4 md:px-6 py-6 text-right whitespace-nowrap">
                  <div className={`font-black text-xs italic tracking-tighter ${item.penaltyAmount > 0 ? 'text-red-500' : 'text-slate-300'}`}>
                    {item.penaltyAmount > 0 ? formatCurrency(item.penaltyAmount) : '-'}
                  </div>
                </td>

                {/* PAYMENT PROOF */}
                <td className="px-4 md:px-6 py-6 text-center whitespace-nowrap">
                  <span className="inline-block max-w-[100px] truncate px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic bg-blue-50 text-blue-600 border-blue-100/70">
                    {item.payment?.paymentProof || "UNKNOWN"}
                  </span>
                </td>

                {/* TOTAL FINAL */}
                <td className="px-4 md:px-6 py-6 text-right whitespace-nowrap">
                  <div className="font-black text-slate-950 text-xs md:text-sm italic tracking-tighter">
                    {formatCurrency(finalTotal)}
                  </div>
                </td>

              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>

</div>
{/* PAGINATION */}
  <div className="flex justify-end mt-1">
  <div className="flex items-center gap-3 bg-slate-950 text-white px-5 py-2 rounded-2xl">

    <button
      onClick={() => setPage(page - 1)}
      disabled={page === 1}
      className="text-xl disabled:opacity-40"
    >
      ‹
    </button>

    <div className="text-xs font-bold">
      {page} / {totalPages}
    </div>

    <button
      onClick={() => setPage(page + 1)}
      disabled={page === totalPages}
      className="text-xl disabled:opacity-40"
    >
      ›
    </button>
  </div>
</div>
  </div>
);
}