"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArchiveRestore } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArchiveItemModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [archivedItems, setArchivedItems] = useState<any[]>([]);
  const [actionId, setActionId] = useState<number | null>(null);

  // Fungsi Fetching Utama
  const fetchArchivedItems = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/item/archive"); 
      setArchivedItems(res.data.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data arsip");
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk resolve URL Gambar
  const getImageUrl = (imageProperty: string) => {
    if (!imageProperty) return "https://via.placeholder.com/300";
    
    // Jika data dari database sudah berupa full URL, langsung return saja
    if (imageProperty.startsWith("http://") || imageProperty.startsWith("https://")) {
      return imageProperty;
    }
    
    // Jika hanya menyimpan nama filenya saja (e.g., "gambar-123.jpg")
    return `http://localhost:3001/uploads/${encodeURIComponent(imageProperty)}`;
  };

  // Efek saat modal dibuka (Duplikasi fungsi di dalam sini sudah dibersihkan)
  useEffect(() => {
    if (isOpen) {
      fetchArchivedItems();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnarchive = async (id: number) => {
    setActionId(id);
    try {
      await api.patch(`/admin/item/unarchive/${id}`);
      toast.success("Item berhasil dikembalikan!");
      fetchArchivedItems();
      onSuccess(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengembalikan item");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl border border-slate-100">
        
        {/* HEADER */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-950">
            Archived <span className="text-blue-600">Items</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {loading && archivedItems.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : archivedItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tidak ada data diarsip</p>
            </div>
          ) : (
            archivedItems.map((item: any) => {
              // Menentukan properti gambar yang tersedia (antisipasi jika namanya item.image atau item.imageUrl)
              const imageSource = item.image || item.imageUrl;

              return (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                >
                  {/* INFO ITEM */}
                  <div className="flex items-center gap-3">
                    {/* Menggunakan imageSource hasil pengecekan di atas */}
                    {imageSource && (
                      <img 
                        src={getImageUrl(imageSource)}
                        alt={item.name} 
                        className="w-10 h-10 object-cover rounded-xl bg-white border border-slate-100" 
                        onError={(e) => {
                          // Fallback jika image ruksak/tidak ditemukan di server backend
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/300";
                        }}
                      />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-slate-950 line-clamp-1">{item.name}</h4>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5 line-clamp-1">
                        {item.description || "No Description"}
                      </p>
                    </div>
                  </div>

                  {/* TOMBOL UNARCHIVE */}
                  <button
                    disabled={actionId !== null}
                    onClick={() => handleUnarchive(item.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-blue-600 text-white rounded-xl font-black uppercase italic tracking-wider text-[9px] transition-all active:scale-95 disabled:opacity-50"
                  >
                    {actionId === item.id ? (
                      <Loader2 className="animate-spin" size={12} />
                    ) : (
                      <>
                        <ArchiveRestore size={12} />
                        Unarchive
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}