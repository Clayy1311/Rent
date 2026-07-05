"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Edit3, Trash2, Layers, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Archive } from "lucide-react";
interface PackageTableProps {
  onDelete: (id: number) => void;
  onEdit: (pkg: any) => void;
}

export function PackageTable({ onDelete, onEdit }: PackageTableProps) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/package");
      setPackages(res.data.data || []);
    } catch (err) {
      toast.error("Gagal mengambil data paket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" />
      </div>
    );
  }

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
        <tr>
          <th className="px-8 py-5">Nama Paket</th>
          <th className="px-8 py-5 text-center">Kapasitas</th>
          <th className="px-8 py-5">Harga Paket</th>
          <th className="px-8 py-5 text-center">Aksi</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {packages.map((pkg: any) => (
          <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                  <Layers size={20} />
                </div>
                <div>
                  <div className="font-black text-slate-900 uppercase tracking-tighter italic">{pkg.package_name}</div>
                  <div className="text-[9px] text-blue-600 font-bold uppercase tracking-widest italic">
                    {pkg.package_items?.length} Alat Terintegrasi
                  </div>
                </div>
              </div>
            </td>
            <td className="px-8 py-6 text-center font-bold text-slate-500 italic">
              {pkg.min_capacity} - {pkg.max_capacity} Orang
            </td>
            <td className="px-8 py-6">
              <div className="font-black text-slate-950 text-base italic text-emerald-600">Rp {pkg.final_price?.toLocaleString("id-ID")}</div>
              <div className="text-[10px] text-slate-400 line-through font-bold">Rp {pkg.original_price?.toLocaleString("id-ID")}</div>
            </td>
            <td className="px-8 py-6">
              <div className="flex justify-center gap-2">
                <button 
                  onClick={() => onEdit?.(pkg)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete?.(pkg.id)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                >
                  
                  <Archive size={16} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
