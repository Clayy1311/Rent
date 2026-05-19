"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { DateFilterHelper } from "@/utils/DateFilterParams";
import { toast } from "sonner";
import { CalendarIcon, Download, Loader2 } from "lucide-react";

type FilterType = "hari" | "minggu" | "bulan" | "tahun" | "custom";

const options = [
  { label: "Hari Ini", value: "hari" },
  { label: "Minggu Ini", value: "minggu" },
  { label: "Bulan Ini", value: "bulan" },
  { label: "Tahun Ini", value: "tahun" },
  { label: "Custom", value: "custom" },
];

export default function ReportFilter() {
  const [selected, setSelected] = useState<FilterType>("bulan");
  const [loading, setLoading] = useState(false);

  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  // 🔥 DOWNLOAD HANDLER
  const handleDownload = async () => {
    if (loading) return;

    setLoading(true);

    try {
      let params;

      if (selected === "custom") {
        if (!dateRange.from || !dateRange.to) {
          toast.error("Pilih tanggal dulu!");
          return;
        }

        params = dateRange;
      } else {
        params = DateFilterHelper(selected);
      }

      const res = await api.get("/admin/reports/donwload", {
        params,
        responseType: "blob",
      });

      const blob = new Blob([res.data], {
        type:
          res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_${selected}_${params.from}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Download berhasil!");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal download");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">

      {/* 🔽 DROPDOWN */}
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as FilterType)}
        className="px-3 h-11 rounded-xl border border-slate-200 text-sm font-semibold outline-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* 📅 CUSTOM DATE */}
      {selected === "custom" && (
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
          <CalendarIcon size={14} className="text-blue-600" />

          <input
            type="date"
            className="bg-transparent text-xs outline-none"
            onChange={(e) =>
              setDateRange({ ...dateRange, from: e.target.value })
            }
          />

          <span className="text-xs text-slate-400">to</span>

          <input
            type="date"
            className="bg-transparent text-xs outline-none"
            onChange={(e) =>
              setDateRange({ ...dateRange, to: e.target.value })
            }
          />
        </div>
      )}

      {/* ⬇️ DOWNLOAD BUTTON */}
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-4 h-11 bg-slate-900 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        Download
      </button>
    </div>
  );
}   