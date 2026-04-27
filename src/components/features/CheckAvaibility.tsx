"use client";

import { useState } from "react";
import { Calendar as CalendarIcon, ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "../../../lib/utils";
import { toast } from "sonner";

interface CheckAvailabilityProps {
  onSearch: (start: Date, end: Date) => void;
  loading?: boolean;
}

export function CheckAvailability({ onSearch, loading }: CheckAvailabilityProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  // Konfigurasi style kalender agar angka hitam tegas
  const calendarClassNames = {
    day: "h-9 w-9 p-0 font-bold text-slate-950 hover:bg-slate-100 rounded-md transition-all aria-selected:opacity-100",
    day_today: "bg-slate-100 text-primary font-black",
    day_selected: "bg-slate-950 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-950 focus:text-white",
    day_disabled: "text-slate-300 opacity-50 pointer-events-none",
    day_outside: "text-slate-300 opacity-50",
    head_cell: "text-slate-500 font-bold uppercase text-[10px] tracking-widest",
    nav_button: "hover:bg-slate-100 rounded-md transition-colors",
  };

  const handleProcessCheck = () => {
    if (!startDate || !endDate) {
      toast.error("Waduh, pilih tanggal mulai dan selesai dulu ya!", {
        description: "Biar kita bisa cek stok alat yang ready buat kamu.",
      });
      return;
    }
    onSearch(startDate, endDate);
  };

  return (
    <div className="relative z-20 -mt-12 container mx-auto px-4">
      <div className="bg-white p-6 md:p-10 rounded-[40px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-end">
          
          {/* Input Tanggal Mulai */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
              Mulai Sewa
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-16 justify-start text-left font-bold rounded-3xl border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all px-6",
                    !startDate && "text-slate-400",
                    startDate && "text-slate-950 border-slate-200"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {startDate ? format(startDate, "dd MMMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  classNames={calendarClassNames}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Input Tanggal Selesai */}
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-2">
              Selesai Sewa
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full h-16 justify-start text-left font-bold rounded-3xl border-slate-100 bg-slate-50 hover:bg-slate-100 transition-all px-6",
                    !endDate && "text-slate-400",
                    endDate && "text-slate-950 border-slate-200"
                  )}
                >
                  <CalendarIcon className="mr-3 h-5 w-5 text-primary" />
                  {endDate ? format(endDate, "dd MMMM yyyy", { locale: id }) : <span>Pilih Tanggal</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-3xl overflow-hidden border-none shadow-2xl z-[100]" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  disabled={(date) => (startDate ? date <= startDate : date < new Date())}
                  initialFocus
                  classNames={calendarClassNames}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Button */}
          <div>
            <Button 
              onClick={handleProcessCheck}
              disabled={loading}
              className="w-full h-16 bg-slate-950 hover:bg-primary text-white rounded-3xl font-black uppercase tracking-tighter italic transition-all group shadow-xl shadow-slate-950/20 disabled:opacity-70"
            >
              {loading ? "Mengecek..." : "Cek Ketersediaan Alat"}
              <ArrowRight className={cn("ml-2 h-5 w-5 transition-transform", !loading && "group-hover:translate-x-2")} />
            </Button>
          </div>

        </div>
        
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 border-t border-slate-50 pt-6">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Pengecekan Real-time</span>
            </div>
            <div className="hidden md:block w-px h-3 bg-slate-200" />
            <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Basecamp Azka: Malang Raya</span>
            </div>
        </div>
      </div>
    </div>
  );
}