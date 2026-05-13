import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

export const useCartStore = create()(
  persist(
    (set) => ({
      cart: [],
      packages: [],

      addToCart: (item: any) => {
        set((state: any) => {
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

      addPackageToCart: (pkg: any) => {
        set((state: any) => {
          if (state.cart.length > 0) {
            toast.error("Selesaikan sewa satuanmu dulu!", {
              description: "Kosongkan keranjang satuan jika ingin menyewa paket bundling."
            });
            return state;
          }

          if (state.packages.some((p: any) => p.id === pkg.id)) {
            toast.info("Paket ini sudah ada di keranjang.");
            return state;
          }

          return { packages: [pkg] }; 
        });
      },

      updateQuantity: (id: number, action: 'plus' | 'minus') => {
        set((state: any) => ({
          cart: state.cart.map((item: any) => {
            if (item.id === id) {
              const newQty = action === 'plus' ? item.quantity + 1 : item.quantity - 1;
              return { ...item, quantity: Math.max(1, newQty) };
            }
            return item;
          })
        }));
      },

      removeFromCart: (id: number) => set((state: any) => ({
        cart: state.cart.filter((i: any) => i.id !== id)
      })),

      removePackage: () => set({ packages: [] }),

      clearCart: () => set({ cart: [], packages: [] }),
    }),
    { name: 'cart-storage' }
  )
);