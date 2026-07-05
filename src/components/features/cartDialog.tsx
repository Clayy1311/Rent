"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Calendar as CalendarIcon,
  PackageOpen,
  Loader2,
  Box,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, differenceInDays, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "../../../lib/utils";
import { toast } from "sonner";
import api from "@/lib/axios";

export function CartDialog() {
  const router = useRouter();

const {
  cart,
  packages,
  removeFromCart,
  updateQuantity,
  clearCart,
  removePackage,
} = useCartStore();
const { token, user, logout } = useAuthStore();
const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [date, setDate] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date(new Date().setDate(new Date().getDate() + 1)),
});

const getImageUrl = (fileName: string) => {
  if (!fileName) return "https://via.placeholder.com/300";
  return `http://localhost:3001/uploads/${encodeURIComponent(fileName)}`;
};

const calculateDays = () => {
  if (!date?.from || !date?.to) return 1;
  const diff = differenceInDays(startOfDay(date.to), startOfDay(date.from));
  return diff <= 0 ? 1 : diff;
};

const validDays = calculateDays();

const totalPrice =
  packages.length > 0
    ? (packages[0].finalPrice || packages[0].final_price || 0) * validDays
    : cart.reduce(
        (total, item) => total + item.price * item.quantity * validDays,
        0,
      );

const handleBooking = async () => {
  if (!token || !user?.id) {
    toast.error("Sesi login kamu habis, silakan login ulang.");
    if (logout) logout();
    return;
  }

  if (!date?.from || !date?.to) {
    return toast.error("Pilih tanggal sewa!");
  }

  const isCartEmpty = cart.length === 0 && packages.length === 0;
  if (isCartEmpty) {
    return toast.error("Keranjang kosong!");
  }

  setLoading(true);

  try {
    let response;

    if (packages.length > 0) {
      const payload = {
        userId: Number(user.id),
        packageId: Number(packages[0].id),
        startDate: format(date.from, "yyyy-MM-dd"),
        endDate: format(date.to, "yyyy-MM-dd"),
      };

      response = await api.post("/package/checkout", payload);
    } else {
      response = await api.post("/bookings", {
        userId: Number(user.id),
        items: cart.map((item) => ({
          itemId: Number(item.id),
          quantity: Number(item.quantity),
        })),
        startDate: format(date.from!, "yyyy-MM-dd"),
        endDate: format(date.to!, "yyyy-MM-dd"),
      });
    }

    const tokenMidtrans = response?.data?.data?.token;

    if (!tokenMidtrans) {
      throw new Error("Token Midtrans tidak ditemukan");
    }

    setOpen(false);
    console.log(window.snap);
    window.snap.pay(tokenMidtrans, {
      onSuccess: function (result: any) {
        toast.success("Pembayaran berhasil!", {
          description: "Pesanan kamu berhasil dibayar.",
        });
        clearCart();
        router.push("/history");
      },
      onPending: function (result: any) {
        toast.info("Menunggu pembayaran", {
          description: "Silakan selesaikan pembayaran kamu.",
        });
        clearCart();
        router.push("/history");
      },
      onError: function (result: any) {
        toast.error("Pembayaran gagal", {
          description: "Terjadi kesalahan saat pembayaran.",
        });
      },
      onClose: function () {
        toast.warning("Popup pembayaran ditutup");
      },
    });
  } catch (err: any) {
    console.log(err);
    const backendMessage = err.response?.data?.message;

    toast.error("Gagal Booking", {
      description: backendMessage || "Terjadi kesalahan pada server.",
      duration: 5000,
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="
    relative flex items-center gap-2
    rounded-full
    border border-slate-200
    bg-slate-50
    shadow-sm
    px-5 h-11
    text-slate-900
    transition-all duration-300
    hover:bg-blue-600
    hover:border-blue-600
    hover:text-white
    group
  "
        >
          <ShoppingCart className="h-5 w-5 text-slate-700 transition-colors group-hover:text-white" />

          <span className="text-sm font-semibold tracking-tight">
            Keranjang
          </span>

          {(cart.length > 0 || packages.length > 0) && (
            <Badge
              className="
        absolute -top-2 -right-2
        min-w-[22px] h-[22px]
        rounded-full
        bg-slate-900
        text-white
        border-2 border-white
        flex items-center justify-center
        text-[11px] font-bold
        px-1.5
        transition-colors
        group-hover:bg-white
        group-hover:text-blue-600
      "
            >
              {cart.length + packages.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[450px] z-[100] bg-slate-950 border-slate-800 text-slate-100 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-white uppercase tracking-tighter">
            <ShoppingCart className="h-5 w-5 text-primary" /> Rincian Sewa
          </DialogTitle>
        </DialogHeader>

        {/* Pemilihan Tanggal */}
        {/* Tanggal */}
        <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-3">
          <p className="text-xs font-semibold text-slate-400">Tanggal Sewa</p>

          <div className="grid grid-cols-2 gap-3">
            {/* START */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 justify-start bg-slate-900 border-slate-700 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-400" />
                  {date?.from
                    ? format(date.from, "dd MMM yyyy", { locale: id })
                    : "Mulai"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto z-[9999] p-0 bg-slate-950 border-slate-800">
                <Calendar
                  mode="single"
                  selected={date?.from}
                  onSelect={(d) => setDate((prev) => ({ ...prev, from: d }))}
                  disabled={(d) => d < startOfDay(new Date())}
                  locale={id}
                />
              </PopoverContent>
            </Popover>

            {/* END */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-12 justify-start bg-slate-950 border-slate-700 text-white"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-emerald-400" />
                  {date?.to
                    ? format(date.to, "dd MMM yyyy", { locale: id })
                    : "Selesai"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto z-[999] p-0 bg-slate-950 border-slate-800">
                <Calendar
                  mode="single"
                  selected={date?.to}
                  onSelect={(d) => setDate((prev) => ({ ...prev, to: d }))}
                  disabled={(d) => d < startOfDay(date?.from || new Date())}
                  locale={id}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Info durasi */}
          <p className="text-[11px] text-emerald-400 font-medium">
            {validDays} hari sewa
          </p>
        </div>

        {/* List Item / Package */}
        <ScrollArea className="max-h-[35vh] pr-4 px-1">
          {cart.length === 0 && packages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-3">
              <PackageOpen className="h-10 w-10 opacity-20" />
              <p className="text-xs">Keranjangmu masih kosong.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* RENDER PAKET (Jika ada) */}
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="flex gap-4 items-center bg-emerald-500/10 border-emerald-500/20 p-3 rounded-2xl border"
                >
                  <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center">
                    <Box className="text-white h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">
                      {pkg.package_name}
                    </h4>
                    <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">
                      Paket Bundling
                    </p>
                    <p className="text-sm text-white font-black">
                      Rp{" "}
                      {(pkg.finalPrice || pkg.final_price || 0).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => removePackage()}
                    disabled={loading}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {/* RENDER ITEM SATUAN (Jika ada) */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 items-center bg-slate-800 p-3 rounded-2xl border border-slate-700"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">
                      {item.name}
                    </h4>

                    <p className="text-[10px] text-slate-400">
                      {validDays} Hari × Rp {item.price.toLocaleString("id-ID")}
                    </p>

                    <p className="text-sm text-primary font-black">
                      Rp{" "}
                      {(item.price * item.quantity * validDays).toLocaleString(
                        "id-ID",
                      )}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-3 bg-slate-950 px-2 py-1 rounded-full border border-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, "minus")}
                      disabled={item.quantity <= 1 || loading}
                      className="text-slate-400 hover:text-white disabled:opacity-30"
                    >
                      <Minus size={12} />
                    </button>

                    <span className="text-xs font-bold text-white">
                      {item.quantity}
                    </span>

                    <button
                      onClick={() => updateQuantity(item.id, "plus")}
                      disabled={loading}
                      className="text-slate-400 hover:text-white"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                    className="text-slate-600 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer Total */}
        {(cart.length > 0 || packages.length > 0) && (
          <div className="pt-4 border-t border-slate-800">
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none">
                  Total Pembayaran
                </span>
                <span className="text-2xl font-black text-white">
                  Rp {totalPrice.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="w-full h-14 rounded-2xl text-md font-bold bg-emerald-500 hover:bg-emerald-600 hover:bg-primary/90 text-white shadow-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />{" "}
                    Memproses...
                  </>
                ) : (
                  "Konfirmasi Booking Sekarang"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
