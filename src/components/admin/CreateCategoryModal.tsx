"use client";

import { useState, useEffect } from "react";
import { X, Loader2, FolderPlus } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: { id: number; name: string } | null; // Tambahkan prop untuk menampung data edit
}

export function CreateCategoryModal({ isOpen, onClose, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  // Cek apakah sedang dalam mode EDIT atau CREATE
  const isEditMode = !!editData;

  // Efek untuk memantau perubahan data saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name); // Set nama jika ada data edit
      } else {
        setName(""); // Reset kosong jika mode tambah baru
      }
    }
  } ,[editData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        // Jika mode edit, gunakan method PUT/PATCH ke endpoint detail category (ganti endpoint jika beda)
        await api.patch(`/category/category/${editData?.id}`, { name });
        toast.success("Kategori Berhasil Diperbarui! 📁");
      } else {
        // Jika mode create, gunakan method POST biasa
        await api.post("/category", { name });
        toast.success("Kategori Berhasil Dibuat! 📁");
      }
      
      onSuccess();
      onClose();
      setName(""); // Reset form
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || 
        `Gagal ${isEditMode ? "memperbarui" : "membuat"} kategori`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xs rounded-[35px] overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100">
        
        {/* Header Compact - Teks berubah dinamis sesuai mode */}
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-sm font-black uppercase italic tracking-tighter text-slate-950">
            {isEditMode ? (
              <>Edit <span className="text-blue-600">Category</span></>
            ) : (
              <>New <span className="text-blue-600">Category</span></>
            )}
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

          {/* Button - Berubah warna menjadi amber jika edit, dan teks berubah dinamis */}
          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-white rounded-2xl font-black uppercase italic tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50 ${
              isEditMode ? "bg-slate-950 hover:bg-blue-600" : "bg-slate-950 hover:bg-blue-600"
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin mx-auto" size={18} />
            ) : isEditMode ? (
              "Update Category"
            ) : (
              "Save Category"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}