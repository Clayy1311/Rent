"use client";

import { useState, useEffect } from "react";
import { X, ArchiveRestore, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ArchivedCategory {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ArchiveCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const [archivedList, setArchivedList] = useState<ArchivedCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchArchivedCategories = async () => {
    try {
      setLoading(true);
      // Ganti URL endpoint ini jika backend memakai route list arsip berbeda
      const res = await api.get("/admin/category/archive"); 
      setArchivedList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil list arsip", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchArchivedCategories();
    }
  }, [isOpen]);

  const handleUnarchive = async (id: number) => {
    setActionId(id);
    try {
      // Menjalankan endpoint restorasi unarchive dari backend-mu
      await api.patch(`/admin/category/unarchive/${id}`);
      toast.success("Kategori berhasil dipulihkan!");
      
      // Refresh list lokal di dalam modal arsip
      fetchArchivedCategories();
      // Refresh list utama di halaman CategoryPage
      onSuccess();
    } catch (err) {
      toast.error("Gagal memulihkan kategori");
    } finally {
      setActionId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[80vh]">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-950">
            Arsip <span className="text-blue-600">Kategori</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[200px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Loader2 className="animate-spin text-blue-600" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading data...</p>
            </div>
          ) : archivedList.length > 0 ? (
            <div className="space-y-2">
              {archivedList.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100/50 hover:border-slate-200 transition-all animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 italic">#{cat.id}</span>
                    <span className="font-black text-slate-900 uppercase italic tracking-tighter text-sm">
                      {cat.name}
                    </span>
                  </div>

                  <button
                    disabled={actionId === cat.id}
                    onClick={() => handleUnarchive(cat.id)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black uppercase italic tracking-wider transition-all disabled:opacity-50"
                  >
                    {actionId === cat.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <ArchiveRestore size={14} />
                    )}
                    Unarchive
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400 font-bold italic uppercase text-center text-[11px] tracking-widest">
              <Search className="mb-2 opacity-20" size={32} />
              Tidak ada kategori yang diarsip.
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}