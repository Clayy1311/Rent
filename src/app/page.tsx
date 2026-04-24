"use client";

import { useState } from "react";
import { useItems } from "@/hooks/useItems";
import { useCartStore } from "@/store/useCartStore";
import { useModalStore } from "@/store/useModalStore";
import { useAuthCheck } from "@/hooks/useAuthCheck";
import { Hero } from "@/components/features/Hero";
import { ItemCard } from "@/components/features/itemCard";
import { AuthModal } from "@/components/features/authModal";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layouts/Navbar";
import { usePackages } from "@/hooks/usePackages";
import { PackageCard } from "@/components/features/packageCard";
export default function LandingPage() {
  const { items, categories, loading, error } = useItems();
  const { mounted, user, token, logout } = useAuthCheck();
  const { isAuthOpen, closeAuth } = useModalStore();
  const { packages, loading: pkgLoading } = usePackages();
  const addToCart = useCartStore((state) => state.addToCart);

  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);

  const filteredItems = selectedCatId
    ? items.filter((item) => item.categoryId === selectedCatId)
    : items;

  return (
    <main className="min-h-screen bg-white">
      <Navbar mounted={mounted} user={user} token={token} logout={logout} />
      <Hero />
      <section className="container mx-auto px-6 py-20">
  <div className="flex items-end justify-between mb-10">
    <div>
      <h2 className="text-3xl font-black text-slate-950 tracking-tighter">Paket Bundling Hemat</h2>
      <p className="text-slate-500">Lebih banyak alat, harga lebih terjangkau.</p>
    </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {packages.map((pkg) => (
      <PackageCard key={pkg.id} pkg={pkg} />
    ))}
  </div>
</section>

      {loading ? (
        <div className="py-20 text-center animate-pulse text-slate-500 font-bold">Menyiapkan...</div>
      ) : error ? (
        <div className="py-20 text-center text-red-500 font-bold">{error}</div>
      ) : (
        <>
          <section className="container mx-auto px-6 py-10 bg-slate-50/50 rounded-[40px] border border-slate-100 mb-16">
            <h3 className="text-xl font-black mb-6 text-slate-900 px-2">Cari berdasarkan kategori</h3>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <Button 
                variant={selectedCatId === null ? "default" : "outline"}
                onClick={() => setSelectedCatId(null)}
                className="rounded-full px-8 h-12 font-bold"
              >Semua Alat</Button>
              {categories?.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCatId === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCatId(cat.id)}
                  className="rounded-full px-8 h-12 font-bold"
                >{cat.name}</Button>
              ))}
            </div>
          </section>

          <section className="container mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} item={item} onAdd={addToCart} />
              ))}
            </div>
          </section>
        </>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={closeAuth} />
    </main>
  );
}