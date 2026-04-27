"use client";

import { CalendarDays, ShoppingCart, Wallet, MapPin } from "lucide-react";

const steps = [
  {
    title: "Pilih Tanggal",
    desc: "Tentukan jadwal muncakmu untuk cek stok alat.",
    icon: CalendarDays,
    color: "bg-blue-500",
  },
  {
    title: "Booking Alat",
    desc: "Pilih perlengkapan terbaik & masukkan keranjang.",
    icon: ShoppingCart,
    color: "bg-slate-950",
  },
  {
    title: "Bayar Online",
    desc: "Selesaikan pembayaran via transfer atau e-wallet.",
    icon: Wallet,
    color: "bg-blue-500",
  },
  {
    title: "Ambil di Basecamp",
    desc: "Ambil alatmu di Basecamp Azka sesuai jadwal.",
    icon: MapPin,
    color: "bg-slate-950",
  },
];

export function RentalFlow() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="text-center mb-16">
        <h4 className="text-blue-600 font-black uppercase tracking-[0.3em] text-[10px] mb-3">Workflow</h4>
        <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">
          Gimana Cara Sewanya?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 relative">
        {/* Garis Penghubung (Hanya muncul di Desktop) */}
        <div className="hidden md:block absolute top-1/4 left-0 w-full h-[2px] bg-slate-100 -z-10" />

        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center text-center group">
            <div className={`w-20 h-20 ${step.color} rounded-[30px] flex items-center justify-center mb-6 shadow-xl shadow-slate-200 group-hover:-translate-y-2 transition-transform duration-300`}>
              <step.icon className="w-8 h-8 text-white" />
            </div>
            
            <div className="bg-white px-4">
               <span className="text-[10px] font-black text-blue-600 uppercase mb-2 block tracking-widest">Langkah {index + 1}</span>
               <h3 className="text-xl font-black text-slate-950 mb-3 tracking-tight italic uppercase">{step.title}</h3>
               <p className="text-slate-500 text-sm leading-relaxed">
                 {step.desc}
               </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}