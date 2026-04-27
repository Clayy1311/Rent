"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
  bookingCode: string;
}

export function ConfirmBookingModal({ isOpen, onClose, onConfirm, loading, bookingCode }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-black tracking-tight">KONFIRMASI PEMBAYARAN</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-slate-600 text-sm leading-relaxed">
            Apakah Anda sudah memverifikasi bukti transfer untuk pesanan <span className="font-bold text-slate-950">{bookingCode}</span>?
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading} className="rounded-xl font-bold">Batal</Button>
          <Button onClick={onConfirm} disabled={loading} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 font-bold px-6">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Konfirmasi Sekarang"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}