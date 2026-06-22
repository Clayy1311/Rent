"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Edit3, Trash2, Loader2, Archive } from "lucide-react";

interface Props {
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
}

export function ProductTable({ onEdit, onDelete }: Props) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.get("/items");
      setItems(res.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" />
      </div>
    );

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest">
        <tr>
          <th className="px-8 py-5">Item</th>
          <th className="px-8 py-5 text-center">Stok</th>
          <th className="px-8 py-5">Harga Sewa</th>
          <th className="px-8 py-5 text-center">Aksi</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-50">
        {items.map((item: any) => (
          <tr
            key={item.id}
            className="hover:bg-slate-50/50 transition-colors"
          >
            <td className="px-8 py-6">
              <div className="flex items-center gap-4">
               

                <div>
                  <div className="font-black text-slate-900 uppercase tracking-tighter italic">
                    {item.name}
                  </div>

                  <div className="text-[10px] text-slate-400 font-medium line-clamp-1">
                    {item.description}
                  </div>
                </div>
              </div>
            </td>

            <td className="px-8 py-6 text-center font-bold text-slate-950 italic">
              {item.stock} Pcs
            </td>

            <td className="px-8 py-6 font-black text-slate-950 text-base italic">
              Rp {item.price?.toLocaleString("id-ID")}
            </td>

            <td className="px-8 py-6">
              <div className="flex justify-center gap-2">

                <button
                  onClick={() => onEdit(item)}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                >
                  <Edit3 size={16} />
                </button>

                <button
                  onClick={() => onDelete(item.id)}
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