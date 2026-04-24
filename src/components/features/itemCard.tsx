"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useModalStore } from "@/store/useModalStore";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ItemCard({ item, onAdd }: { item: any; onAdd: (item: any) => void }) {
  const token = useAuthStore((state) => state.token);
  const openAuth = useModalStore((state) => state.openAuth);

  const handleAction = () => {
    if (!token) {
      openAuth(); // Munculin modal login kalau belum ada token
      return;
    }
    onAdd(item);
  };

  return (
    <div className="group bg-white rounded-[32px] p-4 border border-slate-100 hover:border-primary/20 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-500">
      <div className="relative aspect-square rounded-[24px] bg-slate-50 overflow-hidden mb-5">
        <img
          src={`http://localhost:3001/uploads/${item.image}`}
          alt={item.name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/300")}
        />
        <Badge className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm">
          <Star className="h-3 w-3 fill-orange-400 text-orange-400 mr-1" /> 4.9
        </Badge>
      </div>

      <div className="px-2">
        <h4 className="font-bold text-slate-900 text-lg line-clamp-1 mb-1">{item.name}</h4>
        <p className="text-slate-400 text-[10px] font-black mb-4 uppercase tracking-widest">Premium Equipment</p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">Harga Sewa</span>
            <span className="text-xl font-black text-primary">
              Rp {item.price.toLocaleString("id-ID")}
            </span>
          </div>
          
          <Button 
            size="icon" 
            onClick={handleAction}
            className="h-12 w-12 rounded-2xl bg-slate-950 hover:bg-primary text-white transition-all shadow-lg active:scale-90"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}