"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Loader2, ChevronDown } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

interface ItemOption {
  id: number;
  name: string;
  price: number;
}

interface SelectedItem {
  itemId: string;
  quantity: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

export function CreatePackageModal({ isOpen, onClose, onSuccess, initialData }: Props) {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<ItemOption[]>([]);
  
  const [formData, setFormData] = useState({
    package_name: "",
    description: "",
    min_capacity: "",
    max_capacity: "",
    discount_price: "",
  });

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([
    { itemId: "", quantity: 1 }
  ]);

  // 1. Ambil list master item alat saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      const fetchItems = async () => {
        try {
          const res = await api.get("/items");
          const itemsData = res.data.data || res.data || [];
          setAvailableItems(itemsData);
        } catch (err) {
          console.error("Gagal ambil list item", err);
        }
      };
      fetchItems();
    }
  }, [isOpen]);

  // 2. Sinkronisasi Data Saat Klik Edit (Menunggu availableItems ter-load)
  useEffect(() => {
    if (isOpen && initialData && availableItems.length > 0) {
      setFormData({
        package_name: initialData.package_name || "",
        description: initialData.description || "",
        min_capacity: initialData.min_capacity?.toString() || "",
        max_capacity: initialData.max_capacity?.toString() || "",
        discount_price: initialData.discount_price?.toString() || "",
      });

      // Ambil array relasi dari JSON backend kamu: "package_items"
      const rawItems = initialData.package_items;

      if (rawItems && rawItems.length > 0) {
        setSelectedItems(
          rawItems.map((item: any) => ({
            // FIX: Menggunakan item_id sesuai payload JSON backend-mu
            itemId: item.item_id !== undefined && item.item_id !== null ? String(item.item_id) : "",
            quantity: item.quantity ? Number(item.quantity) : 1
          }))
        );
      } else {
        setSelectedItems([{ itemId: "", quantity: 1 }]);
      }
    } else if (isOpen && !initialData) {
      // Reset state jika klik tambah paket baru
      setFormData({
        package_name: "",
        description: "",
        min_capacity: "",
        max_capacity: "",
        discount_price: "",
      });
      setSelectedItems([{ itemId: "", quantity: 1 }]);
    }
  }, [isOpen, initialData, availableItems]);

  if (!isOpen) return null;

  const addRowItem = () => {
    setSelectedItems([...selectedItems, { itemId: "", quantity: 1 }]);
  };

  const removeRowItem = (index: number) => {
    const newItems = selectedItems.filter((_, i) => i !== index);
    setSelectedItems(newItems);
  };

  const updateItem = (index: number, field: keyof SelectedItem, value: any) => {
    const newItems = [...selectedItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setSelectedItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedItems.some(item => !item.itemId)) {
      return toast.error("Pilih item dulu di setiap baris!");
    }

    setLoading(true);
    try {
      // Menyiapkan format payload yang dikirim balik ke backend
      const payload = {
        ...formData,
        min_capacity: Number(formData.min_capacity),
        max_capacity: Number(formData.max_capacity),
        discount_price: Number(formData.discount_price),
        items: selectedItems.map(item => ({
          itemId: Number(item.itemId),
          quantity: Number(item.quantity)
        }))
      };

      const isEdit = !!initialData;
      if (isEdit) {
        await api.put(`/package/${initialData.id}`, payload);
        toast.success("Paket Bundling Berhasil Diupdate! 🚀");
      } else {
        await api.post("/package/create", payload);
        toast.success("Paket Bundling Berhasil Dibuat! 🚀");
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyimpan paket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[35px] overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-black uppercase italic tracking-tighter text-slate-950">
            {initialData ? "Edit" : "Create"} <span className="text-blue-600">Bundle Package</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Package Name</label>
              <input 
                required
                className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                placeholder="Contoh: Paket Hemat Ber-4"
                value={formData.package_name}
                onChange={(e) => setFormData({...formData, package_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Min Cap</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" placeholder="1" value={formData.min_capacity} onChange={(e) => setFormData({...formData, min_capacity: e.target.value})}/>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Max Cap</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none" placeholder="4" value={formData.max_capacity} onChange={(e) => setFormData({...formData, max_capacity: e.target.value})}/>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-slate-400 px-1">Discount (Rp)</label>
                <input required type="number" className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none text-emerald-600" placeholder="10000" value={formData.discount_price} onChange={(e) => setFormData({...formData, discount_price: e.target.value})}/>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Description</label>
              <textarea required rows={2} className="w-full px-4 py-3 bg-slate-50 rounded-xl font-bold text-sm outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}/>
            </div>
          </div>

          {/* INCLUDED ITEMS SECTION */}
          <div className="space-y-3 border-t border-slate-50 pt-4">
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Included Items</label>
              <button 
                type="button" 
                onClick={addRowItem}
                className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus size={12} /> Add Item
              </button>
            </div>

            <div className="space-y-2">
              {selectedItems.map((item, index) => (
                <div key={index} className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                  <div className="relative flex-1">
                    <select 
                      required
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 rounded-xl font-bold text-[12px] outline-none appearance-none focus:ring-2 focus:ring-blue-600/10 cursor-pointer"
                      value={String(item.itemId)}
                      onChange={(e) => updateItem(index, "itemId", e.target.value)}
                    >
                      <option value="">Pilih Alat</option>
                      {availableItems.map((opt) => (
                        <option key={opt.id} value={String(opt.id)}>
                          {opt.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                  </div>
                  
                  <input 
                    required
                    type="number" 
                    min="1"
                    className="w-16 px-2 py-3 bg-slate-50 rounded-xl font-bold text-sm text-center outline-none"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  />

                  {selectedItems.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeRowItem(index)}
                      className="p-3 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 bg-slate-950 hover:bg-blue-600 text-white rounded-2xl font-black uppercase italic tracking-widest text-xs transition-all active:scale-95 disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : (initialData ? "Update Package" : "Save Package")}
          </button>
        </form>
      </div>
    </div>
  );
}