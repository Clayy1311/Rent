"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useModalStore } from "@/store/useModalStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export function ItemCard({
  item,
  onAdd,
  availability,
}: {
  item: any;
  onAdd: (item: any) => void;
  availability?: any;
}) {
  const token = useAuthStore((state) => state.token);
  const openAuth = useModalStore((state) => state.openAuth);

  const status = availability?.status;
  const available = availability?.available;

  const getImageUrl = (fileName: string) => {
    if (!fileName) return "https://via.placeholder.com/300";
    return `http://localhost:3001/uploads/${encodeURIComponent(fileName)}`;
  };

  const handleAction = () => {
    if (!token) {
      openAuth();
      return;
    }
    if (status === "FULL") return;
    onAdd(item);
  };

  return (
    <div className="group bg-white rounded-3xl p-4 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      
      {/* Image */}
      <div className="relative aspect-square rounded-2xl bg-slate-50 overflow-hidden mb-4">
        <img
          src={getImageUrl(item.image)}
          alt={item.name}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1">
        
        <h4 className="font-semibold text-slate-900 text-base line-clamp-1 mb-1">
          {item.name}
        </h4>

        {/* 🔥 STATUS STOK */}
        {availability && (
          <p
            className={`text-xs font-semibold mb-2
              ${status === "FULL" ? "text-red-500" : ""}
              ${status === "LIMITED" ? "text-yellow-500" : ""}
              ${status === "AVAILABLE" ? "text-green-500" : ""}
            `}
          >
            {status === "FULL" && "Stok Habis"}
            {status === "LIMITED" && `Sisa ${available}`}
            {status === "AVAILABLE" && `Tersedia ${available}`}
          </p>
        )}

        <p className="text-xs text-slate-400 mb-4">
          Peralatan outdoor
        </p>

        {/* Bottom */}
        <div className="flex items-end justify-between mt-auto">
          
          <div>
            <p className="text-xs text-slate-400">Harga Sewa</p>
            <p className="text-lg font-semibold text-slate-900">
              Rp {item.price?.toLocaleString("id-ID")}
            </p>
          </div>

          {/* 🔥 BUTTON */}
          <Button
            size="icon"
            onClick={handleAction}
            disabled={status === "FULL"}
            className={`h-10 w-10 rounded-full text-white transition
              ${
                status === "FULL"
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }
            `}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>

        </div>
      </div>
    </div>
  );
}