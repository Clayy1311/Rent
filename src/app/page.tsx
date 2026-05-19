"use client";

import { useState, useEffect } from "react";
import { useItems } from "@/hooks/useItems";
import { useCartStore } from "@/store/useCartStore";
import { useModalStore } from "@/store/useModalStore";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { usePackages } from "@/hooks/usePackages";

import { Navbar } from "@/components/layouts/Navbar";
import { Hero } from "@/components/features/Hero";
import { Footer } from "@/components/layouts/Footer";
import { ItemCard } from "@/components/features/itemCard";
import { PackageCard } from "@/components/features/packageCard";
import { AuthModal } from "@/components/features/authModal";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { FaqSection } from "@/components/features/FaqSection";
import { RentalFlow } from "@/components/features/RentalFlow";

import { DateFilter } from "@/components/features/DateFilter";

export default function LandingPage() {
  const { items: initialItems, categories, loading } = useItems();
  const { mounted, user, token, logout } = useAuthCheck();
  const { isAuthOpen, closeAuth } = useModalStore();
  const { packages, loading: pkgLoading } = usePackages();

  const addToCart = useCartStore((state) => state.addToCart);

  const [date, setDate] = useState<any>({});
  const [availability, setAvailability] = useState<any[]>([]);
  const [displayItems, setDisplayItems] = useState<any[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  useEffect(() => {
    if (initialItems) {
      setDisplayItems(initialItems);
    }

    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!
    );
    document.body.appendChild(script);
  }, [initialItems]);

  // ✅ FIX FILTER CATEGORY
  const filteredItems = selectedCatId
    ? displayItems.filter((item) => item.categoryId === selectedCatId)
    : displayItems;

  return (
    <main className="min-h-screen bg-[#f8fafc]">
      
      <Navbar mounted={mounted} user={user} token={token} logout={logout} />

      <Hero />

      <section className="py-16 bg-white">
        <RentalFlow />
      </section>

      {/* PACKAGE */}
      <section className="bg-emerald-50/40 border-y border-emerald-100">
        <div className="container mx-auto px-6 py-16">
          
          <div className="mb-10">
            <div className="w-12 h-1 bg-emerald-500 rounded-full mb-4"></div>
            <h2 className="text-3xl font-bold text-slate-900">
              Paket Hemat
            </h2>
          </div>

          {pkgLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* DATE FILTER */}
      <section className="container mx-auto px-6 my-8">
        <DateFilter
          date={date}
          setDate={setDate}
          setAvailability={setAvailability}
        />
      </section>

      {/* CATEGORY */}
      <section className="container mx-auto px-6 my-6">
        <div className="flex flex-wrap gap-3">

          <Button
            variant={selectedCatId === null ? "default" : "outline"}
            onClick={() => setSelectedCatId(null)}
          >
            Semua
          </Button>

          {categories?.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCatId === cat.id ? "default" : "outline"}
              onClick={() => setSelectedCatId(cat.id)}
            >
              {cat.name}
            </Button>
          ))}

        </div>
      </section>

      {/* ITEMS */}
      <section className="container mx-auto px-6 pb-24">
        <div className="bg-white rounded-3xl p-6 border shadow-sm">
          
          <h3 className="text-xl text-black font-semibold mb-6">
            Pilih Peralatanmu
          </h3>

          {!date?.from && (
            <p className="text-sm text-slate-400 mb-4">
              Pilih tanggal dulu untuk melihat ketersediaan
            </p>
          )}

          {loading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : filteredItems.length > 0 ? (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onAdd={addToCart}
                  availability={availability.find(
                    (a) => a.id === item.id
                  )}
                />
              ))}
            </div>

          ) : (
            <p className="text-center text-slate-400">
              Tidak ada item
            </p>
          )}
        </div>
      </section>

      <FaqSection />
      <Footer />

      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </main>
  );
}