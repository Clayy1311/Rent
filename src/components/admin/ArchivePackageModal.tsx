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

export function ArchivePackageModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [archivedPackages, setArchivedPackages] = useState<any[]>([]);
  const [actionId, setActionId] = useState<number | null>(null);

  const fetchArchivedPackages = async () => {
    setLoading(true);
    try {
      // Endpoint arsip khusus paket
      const res = await api.get("/admin/package/archive"); 
      setArchivedPackages(res.data.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data arsip paket");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchArchivedPackages = async () => {
    setLoading(true);
    try {
      // Endpoint arsip khusus paket
      const res = await api.get("/admin/package/archive"); 
      setArchivedPackages(res.data.data || []);
    } catch (err: any) {
      toast.error("Gagal mengambil data arsip paket");
    } finally {
      setLoading(false);
    }
  };
    if (isOpen) {
      fetchArchivedPackages();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnarchive = async (id: number) => {
    setActionId(id);
    try {
      // Endpoint unarchive khusus paket
      await api.patch(`/admin/package/unarchive/${id}`);
      
      toast.success("Paket berhasil dikembalikan!");
      fetchArchivedPackages();
      onSuccess(); 
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal mengembalikan paket");
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
            Archived <span className="text-blue-600">Packages</span>
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-900">
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
          {loading && archivedPackages.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          ) : archivedPackages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Tidak ada paket diarsip</p>
            </div>
          ) : (
            archivedPackages.map((pkg: any) => (
              <div 
                key={pkg.id} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
              >
                {/* INFO PAKET */}
                <div className="flex items-center gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-950 line-clamp-1">{pkg.package_name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mt-0.5">
                      {pkg.package_items?.length || 0} Items Bundled
                    </p>
                  </div>
                </div>

                {/* TOMBOL UNARCHIVE */}
                <button
                  disabled={actionId !== null}
                  onClick={() => handleUnarchive(pkg.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-blue-600 text-white rounded-xl font-black uppercase italic tracking-wider text-[9px] transition-all active:scale-95 disabled:opacity-50"
                >
                  {actionId === pkg.id ? (
                    <Loader2 className="animate-spin" size={12} />
                  ) : (
                    <>
                      <ArchiveRestore size={12} />
                      Unarchive
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}