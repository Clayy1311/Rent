"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

export function DateFilter({ date, setDate, setAvailability }: any) {
  const [loading, setLoading] = useState(false);

  // Ambil tanggal hari ini dengan format YYYY-MM-DD untuk batas minimum input "from"
  const todayStr = format(new Date(), "yyyy-MM-dd");

  // Batas minimum untuk input "to" adalah tanggal "from" yang dipilih, atau hari ini jika belum memilih
  const minToDateStr = date?.from ? format(date.from, "yyyy-MM-dd") : todayStr;

  const handleChange = (type: "from" | "to", value: string) => {
    // Jika input dikosongkan oleh user, set nilainya jadi null/undefined
    if (!value) {
      setDate((prev: any) => ({ ...prev, [type]: undefined }));
      return;
    }
    
    setDate((prev: any) => ({
      ...prev,
      [type]: new Date(value),
    }));
  };

  const handleCheck = async () => {
    if (!date?.from || !date?.to) {
      toast.error("Pilih tanggal dulu!");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/items/availability", {
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      });

      setAvailability(res.data.data);
      toast.success("Berhasil cek ketersediaan");
    } catch (err) {
      console.log(err);
      toast.error("Gagal cek data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl border shadow-sm">
      {/* DATE INPUT */}
      <div className="flex items-center text-black gap-2 bg-slate-50 px-3 py-2 rounded-xl border">
        <CalendarIcon size={16} className="text-black" />

        {/* INPUT TANGGAL MULAI */}
        <input
          type="date"
          className="bg-transparent outline-none text-sm"
          min={todayStr} // Mengunci tanggal sebelum hari ini
          value={date?.from ? format(date.from, "yyyy-MM-dd") : ""}
          onChange={(e) => handleChange("from", e.target.value)}
        />

        <span className="text-slate-400">→</span>

        {/* INPUT TANGGAL SELESAI */}
        <input
          type="date"
          className="bg-transparent outline-none text-sm"
          min={minToDateStr} // Mengunci tanggal sebelum tanggal mulai yang dipilih
          value={date?.to ? format(date.to, "yyyy-MM-dd") : ""}
          onChange={(e) => handleChange("to", e.target.value)}
        />
      </div>

      {/* BUTTON */}
      <Button
        onClick={handleCheck}
        disabled={loading}
        className="bg-emerald-500 hover:bg-emerald-600"
      >
        {loading ? "Loading..." : "Cek"}
      </Button>
    </div>
  );
}