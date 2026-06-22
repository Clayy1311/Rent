"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useModalStore } from "@/store/useModalStore";

export function PackageCard({ pkg }: any) {
  const addPackageToCart = useCartStore((state: any) => state.addPackageToCart);
  const token = useAuthStore((state) => state.token);
  const openAuth = useModalStore((state) => state.openAuth);

  const oriPrice = pkg.originalPrice || pkg.original_price || 0;
  const final_price = pkg.final_price || pkg.final_price || 0;

  const handleAction = () => {
    if (!token) {
      openAuth();
      return;
    }
    addPackageToCart(pkg);
  };

  return (
    <div className="group bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all flex flex-col">
      
      {/* Badge */}
      <div className="mb-4">
        <span className="bg-emerald-100 text-emerald-700 text-[11px] font-medium px-3 py-1 rounded-full">
          Hemat Rp {(oriPrice - final_price).toLocaleString("id-ID")}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-slate-900 mb-1">
        {pkg.package_name}
      </h3>

      <p className="text-sm text-slate-500 mb-5 line-clamp-2">
        {pkg.description}
      </p>

      {/* Items */}
      <div className="space-y-2 mb-6 flex-1">
        {pkg.package_items?.map((pi: any) => (
          <div
            key={pi.id}
            className="flex items-start gap-2 text-sm text-slate-600"
          >
            <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <span>
              {pi.quantity}x {pi.item.name}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="pt-4 border-t border-slate-100">
        
        {/* Price */}
        <div className="mb-4">
          <span className="text-xs text-slate-400 line-through">
            Rp {oriPrice.toLocaleString("id-ID")}
          </span>

          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold text-slate-900">
              Rp {final_price.toLocaleString("id-ID")}
            </span>
            <span className="text-xs text-slate-400 mb-1">/ paket</span>
          </div>
        </div>

        {/* Button */}
        <Button
          onClick={handleAction}
          className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white font-medium transition-all"
        >
          Pilih Paket
        </Button>
      </div>
    </div>
  );
}