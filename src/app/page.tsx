"use client";

import { useState, useEffect } from "react";
import { useItems } from "@/hooks/useItems";
import { useCartStore } from "@/store/useCartStore";
import { useModalStore } from "@/store/useModalStore";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { usePackages } from "@/hooks/usePackages";
import api from "@/lib/axios";
import { RentalFlow } from "@/components/features/RentalFlow";
// Components
import { Navbar } from "@/components/layouts/Navbar";
import { Hero } from "@/components/features/Hero";
import { WhyChooseUs } from "@/components/features/WhyChooseUs";
import { Footer } from "@/components/layouts/Footer";
import { ItemCard } from "@/components/features/itemCard";
import { PackageCard } from "@/components/features/packageCard";
import { AuthModal } from "@/components/features/authModal";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { FaqSection } from "@/components/features/FaqSection";

import { toast } from "sonner";

export default function LandingPage() {
  const { items: initialItems, categories, loading: initialLoading, error } = useItems();
  const { mounted, user, token, logout } = useAuthCheck();
  const { isAuthOpen, closeAuth } = useModalStore();
  const { packages, loading: pkgLoading } = usePackages();
  const addToCart = useCartStore((state) => state.addToCart);

  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);

  useEffect(() => {
    if (initialItems) {
      setDisplayItems(initialItems);
    }
    const script = document.createElement("script")

   script.src =
      "https://app.sandbox.midtrans.com/snap/snap.js"

   script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
   )

   document.body.appendChild(script)
  }, [initialItems]);



  const filteredItems = selectedCatId
    ? displayItems.filter((item) => item.categoryId === selectedCatId)
    : displayItems;

  return (
    <main className="min-h-screen bg-white">
      <Navbar mounted={mounted} user={user} token={token} logout={logout} />
      
      <Hero />

      <div className="">
     
        <RentalFlow />
      </div>

      {/* 4. Paket Bundling Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h4 className="text-primary font-black uppercase tracking-widest text-[10px] mb-2">Hemat Banget</h4>
            <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic">Paket Bundling</h2>
            <p className="text-slate-500 text-sm">Peralatan lengkap dalam satu harga, nggak ribet.</p>
          </div>
        </div>

        {pkgLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        )}
      </section>

 

      {/* 5. Filter Kategori (Warna Hitam -> Biru) */}
      <section className="container mx-auto px-6 mb-10">
        <div className="bg-slate-50/80 backdrop-blur-sm p-8 rounded-[40px] border border-slate-100">
          <h3 className="text-xs font-black mb-6 text-slate-400 uppercase tracking-[0.2em] px-2 text-center">
            Pilih Kategori Perlengkapan
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            <Button 
              variant="outline"
              onClick={() => setSelectedCatId(null)}
              className={`rounded-full px-8 h-12 font-bold transition-all border-none shadow-sm ${
                selectedCatId === null 
                ? "bg-blue-600 text-white shadow-blue-200" 
                : "bg-slate-950 text-white hover:bg-slate-800"
              }`}
            >
              Semua Alat
            </Button>
            {categories?.map((cat) => (
              <Button
                key={cat.id}
                variant="outline"
                onClick={() => setSelectedCatId(cat.id)}
                className={`rounded-full px-8 h-12 font-bold transition-all border-none shadow-sm ${
                  selectedCatId === cat.id 
                  ? "bg-blue-600 text-white shadow-blue-200" 
                  : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Info Status Filter */}
      {isFiltered && !isFilterLoading && (
        <div className="container mx-auto px-6 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            Menampilkan alat tersedia untuk tanggal pilihanmu
          </div>
        </div>
      )}

      {/* 6. Product List Section */}
      {(initialLoading || isFilterLoading) ? (
        <div className="py-20 text-center">
          <Loader2 className="animate-spin mx-auto text-primary mb-4" />
          <p className="animate-pulse text-slate-400 text-xs font-bold uppercase tracking-widest">
            {isFilterLoading ? "Mengecek Ketersediaan..." : "Memuat perlengkapan..."}
          </p>
        </div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold bg-red-50 rounded-[40px] mx-6 border border-red-100">
            {error}
        </div>
      ) : (
        <section className="container mx-auto px-6 pb-32">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-bold">Waduh, nggak ada alat yang tersedia. 😭</p>
              <Button 
                variant="link" 
                onClick={() => { setDisplayItems(initialItems); setIsFiltered(false); }}
                className="mt-2 text-primary font-bold"
              >
                Reset Filter
              </Button>
            </div>
          )}
        </section>
      )}
      <div className="bg-slate-50/50">
        <FaqSection />
      </div>
<Footer />
      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </main>
  );
}