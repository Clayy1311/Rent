"use client";

import { useState } from "react";
import { X, Loader2, FolderPlus } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCategoryModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/category", { name });
      
      toast.success("Kategori Berhasil Dibuat! 📁");
      onSuccess();
      onClose();
      setName(""); // Reset form
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal membuat kategori");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xs rounded-[35px] overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100">
        
        {/* Header Compact */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-950">
            New <span className="text-blue-600">Category</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Category Name</label>
            <div className="relative">
              <FolderPlus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                required
                autoFocus
                className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl font-bold text-sm text-slate-900 placeholder:text-slate-300 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                placeholder="E.g. Tenda"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-950 hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Category"}
          </button>
        </form>
      </div>
    </div>
  );
}