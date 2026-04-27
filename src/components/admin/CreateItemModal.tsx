"use client";

import { useState, useEffect } from "react"; // Tambahkan useEffect
import { X, Upload, Loader2, ChevronDown } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateItemModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]); // State simpan kategori
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null as File | null,
  });

  // Fetching kategori saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const res = await api.get("/category");
          setCategories(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch categories", err);
        }
      };
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error("Pilih kategori dulu, Prof!");
    
    setLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("categoryId", formData.categoryId);
      if (formData.image) data.append("image", formData.image);

      await api.post("/items", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Item Berhasil Ditambahkan!");
      onSuccess();
      onClose();
      // Reset
      setFormData({ name: "", description: "", price: "", stock: "", categoryId: "", image: null });
      setImagePreview(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menambah produk");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[35px] overflow-hidden shadow-2xl animate-in zoom-in-95 border border-slate-100">
        
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-950">
            New <span className="text-blue-600">Item</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Upload Image */}
          <div 
            className="relative h-32 w-full border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer overflow-hidden group hover:border-blue-400 transition-all"
            onClick={() => document.getElementById('fileInput')?.click()}
          >
            {imagePreview ? (
              <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
            ) : (
              <div className="text-center">
                <Upload className="mx-auto text-slate-300 group-hover:text-blue-600" size={20} />
                <p className="text-[8px] font-black uppercase text-slate-400 mt-1">Upload Image</p>
              </div>
            )}
            <input id="fileInput" type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="space-y-3">
            {/* Input Name */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Item Name</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10"
                placeholder="E.g. Tenda Eiger 4P"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* Select Category */}
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
              <div className="relative">
                <select 
                  required
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none appearance-none focus:ring-2 focus:ring-blue-600/10 cursor-pointer"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="" disabled>Pilih Kategori</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Price</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})}/>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Stock</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})}/>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
              <textarea required rows={2} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-950 hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Save Product"}
          </button>
        </form>
      </div>
    </div>
  );
}