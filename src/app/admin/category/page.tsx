"use client";

import { useEffect, useState } from "react";
import { Tag, Plus, Trash2, Loader2, Search } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { CreateCategoryModal } from "@/components/admin/CreateCategoryModal";

interface Category {
  id: number;
  name: string;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await api.get("/category");
        // Kita ambil res.data.data karena struktur API kamu dibungkus objek data
        setCategories(res.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Gagal mengambil data kategori");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [refreshKey]);

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await api.delete(`/category/${id}`);
      toast.success("Kategori berhasil dihapus!");
      setRefreshKey(prev => prev + 1); // Trigger refresh data
    } catch (err) {
      toast.error("Gagal menghapus kategori");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Kelola <span className="text-blue-600">Kategori</span>
          </h1>
          <p className="text-slate-500 font-medium italic">Atur pengelompokan unit alat Azka Outdoor.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-950 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl"
        >
          <Plus size={16} className="inline mr-2" /> Tambah Kategori
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
                <tr>
                  <th className="px-8 py-5">ID</th>
                  <th className="px-8 py-5">Nama Kategori</th>
                  <th className="px-8 py-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <tr key={cat.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-slate-400 italic">#{cat.id}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                            <Tag size={18} />
                          </div>
                          <span className="font-black text-slate-900 uppercase italic tracking-tighter text-base">
                            {cat.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center">
                          <button 
                            onClick={() => handleDelete(cat.id)}
                            className="p-3 bg-slate-50 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase text-xs tracking-widest">
                      <Search className="mx-auto mb-2 opacity-20" size={40} />
                      Belum ada data kategori.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Render */}
      <CreateCategoryModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => setRefreshKey(prev => prev + 1)}
      />
    </div>
  );
}