"use client";

import { ShieldCheck, Clock, MapPin, BadgeCheck, Zap, HeartHandshake } from "lucide-react";

const reasons = [
  {
    title: "Alat Premium",
    desc: "alat dari brand ternama dan terjamin kualitasnya.",
    icon: <BadgeCheck className="w-8 h-8 text-emerald-500" />,
  },
  {
    title: "Fast Response",
    desc: "Admin standby 24/7 untuk membantu.",
    icon: <Zap className="w-8 h-8 text-yellow-500" />,
  },
  
  {
    title: "Harga Kompetitif",
    desc: "Sewa alat kualitas pro tanpa bikin kantong bolong.",
    icon: <ShieldCheck className="w-8 h-8 text-blue-500" />,
  },
  {
    title: "Peminjaman Mudah",
    desc: "Proses cepat, syarat simpel, langsung bisa angkut.",
    icon: <Clock className="w-8 h-8 text-purple-500" />,
  },
  {
    title: "Garansi Kepuasan",
    desc: "Alat kotor atau rusak? Kami siapkan penggantinya.",
    icon: <HeartHandshake className="w-8 h-8 text-pink-500" />,
  },
];

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-16 text-center">
        <h4 className="text-primary font-black uppercase tracking-[0.3em] text-xs mb-4">
          Kenapa Harus Azka Outdoor?
        </h4>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter italic uppercase">
          Partner Petualangan <br /> Terbaik Anda
        </h2>
      </div>

      {/* Container Slide */}
      <div className="relative flex overflow-x-hidden">
        {/* Grup 1 */}
        <div className="flex animate-marquee whitespace-nowrap gap-6 py-4">
          {reasons.map((item, idx) => (
            <CardReason key={idx} {...item} />
          ))}
        </div>
        {/* Grup 2 (Duplikasi untuk efek infinite scroll) */}
        <div className="flex absolute top-0 animate-marquee2 whitespace-nowrap gap-6 py-4">
          {reasons.map((item, idx) => (
            <CardReason key={idx} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CardReason({ title, desc, icon }: { title: string; desc: string; icon: any }) {
  return (
    <div className="w-[350px] bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 shrink-0 group">
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/5 transition-all">
        {icon}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 uppercase italic tracking-tighter">
        {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}