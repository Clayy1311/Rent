"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { toast } from "sonner";

export function DateFilter({
  date,
  setDate,
  setAvailability,
}: any) {
  const [loading, setLoading] = useState(false);

  const handleChange = (type: "from" | "to", value: string) => {
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

        <input
          type="date"
          className="bg-transparent outline-none text-sm"
          onChange={(e) => handleChange("from", e.target.value)}
        />

        <span className="text-slate-400">→</span>

        <input
          type="date"
          className="bg-transparent outline-none text-sm"
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