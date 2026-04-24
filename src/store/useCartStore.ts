import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner'; // atau library toast yang kamu pakai

export const useCartStore = create()(
  persist(
    (set) => ({
      cart: [],     // Untuk item satuan
      packages: [], // Untuk paket bundling

      // --- TAMBAH ITEM SATUAN ---
      addToCart: (item: any) => {
        set((state: any) => {
          // CEK: Jika sudah ada paket di keranjang
          if (state.packages.length > 0) {
            toast.error("Selesaikan sewa paketmu dulu!", {
              description: "Kosongkan keranjang paket jika ingin menyewa item satuan."
            });
            return state;
          }

          const existingItem = state.cart.find((i: any) => i.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((i: any) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        });
      },

      // --- TAMBAH PAKET BUNDLING ---
      addPackageToCart: (pkg: any) => {
        set((state: any) => {
          // CEK: Jika sudah ada item satuan di keranjang
          if (state.cart.length > 0) {
            toast.error("Selesaikan sewa satuanmu dulu!", {
              description: "Kosongkan keranjang satuan jika ingin menyewa paket bundling."
            });
            return state;
          }

          // CEK: Jika sudah ada paket lain (Biasanya sewa paket dibatasi 1 jenis agar stok aman)
          if (state.packages.some((p: any) => p.id === pkg.id)) {
            toast.info("Paket ini sudah ada di keranjang.");
            return state;
          }

          // Karena Opsi 1, kita ganti isi packages dengan paket baru ini
          return { packages: [pkg] }; 
        });
      },

      // --- CLEAR SEMUA ---
      clearCart: () => set({ cart: [], packages: [] }),

      // --- HAPUS PER ITEM ---
      removeFromCart: (id: number) => set((state: any) => ({
        cart: state.cart.filter((i: any) => i.id !== id)
      })),

      removePackage: () => set({ packages: [] }),
    }),
    { name: 'cart-storage' }
  )
);