"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Item, Package } from "@/types";
import { toast } from "sonner";
import { DateFilter } from "@/components/features/DateFilter";
type CartItem = {
  id: number;
  name: string;
  price: number; // Ini akan menyimpan harga dasar/eceran item atau harga akumulasi item paket sebelum diskon
  qty: number;
  isPackage?: boolean;
  discountPrice?: number; // Menyimpan potongan harga paket
  packageItems?: any[];
};

export default function AdminBookingPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [date, setDate] = useState<any>({});
  const [availability, setAvailability] = useState<number>(0);
  const [name, setName] = useState("");
  const [phoneNumber, setPhone] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "TRANSFER" | "QRIS"
  >("CASH");
  const [loading, setLoading] = useState(false);

  const downloadInvoice = async (bookingId: number) => {
    try {
      const res = await api.get(`/bookings/${bookingId}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-booking-${bookingId}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  // Fetch Items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/items");
        setItems(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchItems();
  }, []);

  // Fetch Packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/package");
        setPackages(res.data.data || []);
      } catch (err) {
        console.log(err);
      }
    };
    fetchPackages();
  }, []);

  // Tambah Item Retail
  const addToCart = (item: Item) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === item.id && !i.isPackage);
      if (exist) {
        return prev.map((i) =>
          i.id === item.id && !i.isPackage ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          isPackage: false,
        },
      ];
    });
  };

  // Tambah Paket langsung menggunakan harga paket terhitung
  const addPackageToCart = (pkg: Package) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.id === pkg.id && i.isPackage);
      if (exist) {
        toast.error("Paket ini sudah ada di keranjang!");
        return prev;
      }

      // Hitung total harga eceran item di dalam paket sebelum diskon
      const originalPricePerDay =
        pkg.package_items?.reduce((total, pi) => {
          return total + pi.item.price * pi.quantity;
        }, 0) || 0;

      return [
        ...prev,
        {
          id: pkg.id,
          name: pkg.package_name,
          price: originalPricePerDay, // Pakai harga original eceran untuk bypass kalkulasi backend
          discountPrice: pkg.discount_price, // Simpan variabel diskonnya di sini
          qty: 1,
          isPackage: true,
          packageItems: pkg.package_items,
        },
      ];
    });
    toast.success(`${pkg.package_name} masuk keranjang`);
  };

  // Kurangi Qty (Hanya berlaku untuk non-paket)
  const decreaseQty = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id && !item.isPackage
            ? { ...item, qty: item.qty - 1 }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  // Hapus Item/Paket
  const removeItem = (id: number, isPackage?: boolean) => {
    setCart((prev) =>
      prev.filter((item) => !(item.id === id && item.isPackage === isPackage)),
    );
  };

  // Hitung Durasi
  const getDuration = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );
    return diff > 0 ? diff : 1;
  };

  const duration = getDuration();

  // 🔥 LOGIC HITUNG TOTAL DI FE: (Harga Original - Potongan Diskon) * Durasi
  const total = cart.reduce((acc, item) => {
    if (item.isPackage) {
      const packagePricePerDay = item.price - (item.discountPrice || 0);
      return acc + packagePricePerDay * item.qty * duration;
    }
    return acc + item.price * item.qty * duration;
  }, 0);

  const formatRupiah = (num: number) =>
    new Intl.NumberFormat("id-ID").format(num);

  // Submit Booking Admin
  const handleSubmit = async () => {
    if (!cart.length) return alert("Keranjang belanja masih kosong!");
    if (!name || !phoneNumber || !startDate || !endDate)
      return alert("Mohon lengkapi seluruh data!");

    setLoading(true);

    try {
      // 💡 Hitung total discount_price seluruh paket yang masuk ke cart
      const totalDiscount = cart.reduce((acc, item) => {
        if (item.isPackage) {
          return acc + (item.discountPrice || 0) * item.qty;
        }
        return acc;
      }, 0);

      const res = await api.post("/admin/createbooking", {
        name,
        phoneNumber,
        startDate,
        endDate,
        paymentMethod,
        discount: totalDiscount, // 🔥 KIRIM NOMINAL POTONGAN KE BACKEND
        items: cart.flatMap((item) => {
          if (item.isPackage) {
            return (
              item.packageItems?.map((pkgItem) => ({
                itemId: pkgItem.item.id,
                quantity: pkgItem.quantity,
              })) || []
            );
          } else {
            return [
              {
                itemId: item.id,
                quantity: item.qty,
              },
            ];
          }
        }),
      });

      const bookingId = res.data.data.booking.id;
      await downloadInvoice(bookingId);

      toast.success("Booking berhasil dibuat!");

      setCart([]);
      setName("");
      setPhone("");
      setStartDate("");
      setEndDate("");
    } catch (err) {
      console.log(err);
      toast.error("Gagal memproses booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-slate-50 min-h-screen text-slate-800 antialiased">
      {/* SISI KIRI: Katalog Produk & Paket */}
      <div className="lg:col-span-2 space-y-6">
        {/* SECTION ITEMS */}
        <section className="container mx-auto px-6 my-8">
          <DateFilter
            date={date}
            setDate={setDate}
            setAvailability={setAvailability}
          />
        </section>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Pilih Item
            </h2>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {items.length} Item Tersedia
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items?.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="group relative p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500 hover:shadow-md hover:shadow-emerald-50/50 transition-all duration-200 text-left flex flex-col justify-between min-h-[120px]"
              >
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-sm font-bold text-slate-700 mt-1">
                    Rp {formatRupiah(item.price)}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / hari
                    </span>
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between w-full border-t border-slate-50 pt-2">
                 {availability.length > 0 && (
  <span
    className={`text-xs px-2 py-0.5 rounded-md font-medium ${
      availability[0]?.available > 0 ? "bg-slate-100 text-slate-600" : "bg-rose-50 text-rose-600"
    }`}
  >
    Stok: {availability[0]?.available}
  </span>
)}
                  <span className="text-xs font-semibold text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    Tambah +
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SECTION PACKAGES */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Paket Hemat
            </h2>
            <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              Bundling
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {packages?.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => addPackageToCart(pkg)}
                className="group p-4 border border-indigo-100 rounded-xl bg-gradient-to-b from-indigo-50/40 to-indigo-50/10 hover:border-indigo-400 hover:shadow-md transition-all duration-200 text-left flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <p className="font-bold text-indigo-900 group-hover:text-indigo-700 transition-colors">
                    {pkg.package_name}
                  </p>
                  <div className="text-xs mt-3 space-y-1.5 text-indigo-950/70">
                    {pkg.package_items?.map((i) => (
                      <div key={i.id} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-indigo-400" />
                        <span>
                          {i.item.name}{" "}
                          <strong className="text-indigo-900">
                            x{i.quantity}
                          </strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-2 border-t border-indigo-100/60 w-full flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">
                    Rp {formatRupiah(pkg.final_price)} / hari
                  </span>
                  <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                    Pilih Paket
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SISI KANAN: Form Checkout & Detail Booking */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 h-fit sticky top-6">
        <h2 className="font-bold text-xl tracking-tight text-slate-900 pb-2 border-b">
          Detail Booking
        </h2>

        {/* SECTION KERANJANG (CART) */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Item Terpilih
          </label>
          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1 subtle-scrollbar">
            {cart.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-xl border-slate-200 text-slate-400 text-sm">
                Belum ada item yang dipilih
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={`${item.id}-${item.isPackage}`}
                  className={`p-3 rounded-xl border flex flex-col gap-2 ${item.isPackage ? "bg-indigo-50/40 border-indigo-100" : "bg-slate-50 border-slate-100"}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900">
                          {item.name}
                        </p>
                        {item.isPackage && (
                          <span className="bg-indigo-100 text-indigo-700 font-bold text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider">
                            Paket
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Rp{" "}
                        {formatRupiah(
                          item.isPackage
                            ? item.price - (item.discountPrice || 0)
                            : item.price,
                        )}{" "}
                        × {duration} hari
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.isPackage)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors text-xs font-medium"
                    >
                      Hapus
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-1.5 border-t border-slate-200/60 mt-1">
                    <span className="text-xs font-bold text-emerald-600">
                      Rp{" "}
                      {formatRupiah(
                        (item.isPackage
                          ? item.price - (item.discountPrice || 0)
                          : item.price) *
                          item.qty *
                          duration,
                      )}
                    </span>

                    {item.isPackage ? (
                      <span className="text-[10px] font-bold text-indigo-500 italic px-2 bg-indigo-50 py-0.5 rounded-md border border-indigo-100/40">
                        Qty Terkunci (1)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 bg-white border rounded-lg p-0.5 shadow-sm">
                        <button
                          onClick={() => decreaseQty(item.id)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md font-bold transition-colors text-sm"
                        >
                          -
                        </button>
                        <span className="text-xs font-semibold px-2 min-w-[20px] text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => addToCart(item as any)}
                          className="w-6 h-6 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-md font-bold transition-colors text-sm"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECTION INPUT INFORMASI CUSTOMER */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Informasi Pelanggan
          </label>
          <div>
            <input
              type="text"
              placeholder="Nama Lengkap Customer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <input
              type="tel"
              placeholder="Nomor WhatsApp/HP"
              value={phoneNumber}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border border-slate-200 p-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 ml-1">
                Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 block mb-1 ml-1">
                Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-slate-200 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-slate-50 border p-2.5 rounded-xl text-xs font-medium text-slate-600">
            <span>Durasi Sewa:</span>
            <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border shadow-sm">
              {duration} Hari
            </span>
          </div>
        </div>

        {/* SECTION METODE PEMBAYARAN */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Metode Pembayaran
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-full border border-slate-200 p-2.5 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm transition-all cursor-pointer"
          >
            <option value="CASH">💵 Cash / Tunai</option>
            <option value="TRANSFER">🏦 Bank Transfer</option>
            <option value="QRIS">📱 QRIS Digital</option>
          </select>
        </div>

        {/* SECTION TOTAL & SUBMIT BUTTON */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-sm font-medium text-slate-500">
              Total Pembayaran
            </span>
            <div className="text-2xl font-black text-emerald-600 tracking-tight">
              Rp {formatRupiah(total)}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 px-4 rounded-xl font-bold text-sm transition-all duration-150 shadow-md shadow-emerald-600/10 active:scale-[0.99] flex justify-center items-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Memproses...
              </>
            ) : (
              "Konfirmasi & Buat Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
