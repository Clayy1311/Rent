import { ArrowRight, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="container mx-auto px-6  md:py-32 grid md:grid-cols-2 gap-16 items-center">
      <div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-slate-950 leading-[0.95] mb-6">
          Peralatan lengkap,<br /> petualangan <span className="text-primary">sempurna.</span>
        </h1>
        <p className="text-lg text-slate-600 mb-12 max-w-md">
          Sewa alat outdoor kualitas premium dengan proses cepat. Pilih alatmu, tentukan tanggal, dan berangkat!
        </p>
        
      </div>

      <div className="relative h-[500px] w-full flex items-center justify-center">
        <div className="absolute -inset-10 bg-gradient-to-tr from-primary/10 to-primary/30 rounded-full blur-3xl opacity-40" />
        <div className="absolute left-10 top-0 bg-white p-5 rounded-2xl shadow-2xl w-56 transform rotate-[-2deg] border border-slate-50 z-20">
          <div className="flex items-center gap-3 mb-3">
            <Briefcase className="h-5 w-5 text-orange-600"/>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Mountain</span>
          </div>
          <img src="/image/2.jpg" alt="Gear" className="h-36 w-full object-contain mb-3" />
          <h4 className="font-bold text-slate-900">Outdoor</h4>
        </div>
        <div className="absolute right-0 top-20 bg-primary p-6 rounded-2xl shadow-2xl w-64 transform rotate-[6deg] z-30">
          <img src="/image/1.jpg" alt="Tenda" className="h-44 w-auto mx-auto mb-4 object-contain" />
          <h4 className="font-bold text-white text-xl">Mountain</h4>
        </div>
      </div>
    </section>
  );
}