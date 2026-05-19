import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0f172a] text-white">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <img
          src="/image/1.jpg"
          alt="Mountain"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-[#0f172a]" />
      </div>

      <div className="relative container mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        {/* LEFT */}
        <div>
          <p className="text-sm text-white/70 mb-4">
            Rental alat outdoor • Tuban
          </p>

          <h1 className="text-4xl md:text-6xl font-semibold leading-tight mb-6">
           Persewaan Alat Outdoor Terlengkap di Tuban
            <br />
           
          </h1>

          <p className="text-white/80 mb-8 max-w-md">
            Sewa perlengkapan yang kamu butuhin, tanpa ribet. Semua sudah siap
            pakai, tinggal berangkat.
          </p>

        <div className="inline-flex items-center gap-3 bg-emerald-500/90 text-white px-6 py-3 rounded-full text-sm font-medium">
  <span>Perlengkapan lengkap & siap pakai</span>
  <span className="opacity-70">•</span>
  <span>Tanpa ribet</span>
</div>

          {/* small trust */}
          <div className="flex items-center gap-6 mt-10 text-sm text-white/70">
            <span>✔ Alat bersih & siap pakai</span>
            <span>✔ Bisa ambil langsung</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative h-[420px] w-full">
          {/* Image belakang */}
          <div className="absolute top-0 right-0 w-[80%] h-[70%] rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/image/1.jpg"
              className="w-full h-full object-cover"
              alt="mountain"
            />
          </div>

          {/* Image depan */}
          <div className="absolute bottom-0 left-0 w-[70%] h-[60%] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0f172a]">
            <img
              src="/image/2.jpg"
              className="w-full h-full object-cover"
              alt="camping"
            />
          </div>

          {/* small badge */}
         
        </div>
      </div>
    </section>
  );
}
