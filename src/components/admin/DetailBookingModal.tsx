"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Package, User, Calendar, CreditCard, ExternalLink } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export function DetailBookingModal({ isOpen, onClose, data }: Props) {
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white rounded-[32px] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 bg-slate-950 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Detail Transaksi</p>
              <DialogTitle className="text-2xl font-black italic">{data.bookingCode}</DialogTitle>
            </div>
            <div className="bg-emerald-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase">
              {data.status.replace("_", " ")}
            </div>
          </div>
        </DialogHeader>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          {/* Section 1: Info Pelanggan & Tanggal */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                <User size={14} /> Pelanggan
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="font-bold text-slate-900">{data.user?.name}</p>
                <p className="text-xs text-slate-500">{data.user?.email}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase">
                <Calendar size={14} /> Durasi Sewa
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-xs">
                <p className="font-bold text-slate-900">
                  {format(new Date(data.startDate), "dd MMM yyyy", { locale: id })}
                </p>
                <p className="text-slate-500">s/d {format(new Date(data.endDate), "dd MMM yyyy", { locale: id })}</p>
              </div>
            </div>
          </div>

          {/* Section 2: Items List */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase italic">
              <Package size={14} /> Barang yang Disewa
            </div>
            <div className="space-y-2">
              {data.items?.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden">
                      <img 
                        src={`http://localhost:3001/uploads/${item.item?.image}`} 
                        className="w-full h-full object-cover"
                        alt={item.item?.name}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{item.item?.name}</p>
                      <p className="text-[10px] text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm text-slate-900">
                    Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Info Pembayaran */}
          <div className="bg-slate-950 rounded-[24px] p-6 text-white flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase mb-1">
                <CreditCard size={14} /> Total Pembayaran
              </div>
              <p className="text-2xl font-black text-emerald-400">
                Rp {data.totalPrice?.toLocaleString("id-ID")}
              </p>
            </div>
            {data.payment?.paymentProof && (
              <a 
                href={`http://localhost:3001/${data.payment.paymentProof.replace(/\\/g, '/')}`}
                target="_blank"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-all px-4 py-2 rounded-xl text-xs font-bold"
              >
                <ExternalLink size={14} /> Bukti Transfer
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}