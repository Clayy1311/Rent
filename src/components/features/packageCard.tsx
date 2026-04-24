// components/features/PackageCard.tsx
"use client"; // Tambahkan ini karena kita pakai hook zustand (client-side)

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore"; // Import store kamu

export function PackageCard({ pkg }: any) {
  // Ambil fungsi addPackageToCart dari store
  const addPackageToCart = useCartStore((state: any) => state.addPackageToCart);

  // Antisipasi perbedaan key original_price vs originalPrice dari backend
  const oriPrice = pkg.originalPrice || pkg.original_price || 0;
  const finalPrice = pkg.finalPrice || pkg.final_price || 0;

  const handleSelectPackage = () => {
    // Kita kirim seluruh object pkg ke store
    addPackageToCart(pkg);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col">
      <div className="mb-4">
        <span className="bg-primary/10 text-primary text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
          Hemat Rp {(oriPrice - finalPrice).toLocaleString('id-ID')}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.package_name}</h3>
      <p className="text-sm text-slate-500 mb-6 line-clamp-2">{pkg.description}</p>

      {/* Daftar Item dalam Paket */}
      <div className="space-y-3 mb-8 flex-1">
        {pkg.package_items?.map((pi: any) => (
          <div key={pi.id} className="flex items-start gap-2 text-sm text-slate-600">
            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <span>{pi.quantity}x {pi.item.name}</span>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-slate-50">
        <div className="flex flex-col mb-4">
          <span className="text-xs text-slate-400 line-through">
            Rp {oriPrice.toLocaleString('id-ID')}
          </span>
          <span className="text-2xl font-black text-slate-950">
            Rp {finalPrice.toLocaleString('id-ID')}
          </span>
        </div>
        
        {/* Hubungkan fungsi di sini */}
        <Button 
          onClick={handleSelectPackage}
          className="w-full rounded-full font-bold hover:scale-[1.02] transition-transform active:scale-95"
        >
          Pilih Paket
        </Button>
      </div>
    </div>
  );
}