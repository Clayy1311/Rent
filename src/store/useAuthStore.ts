import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  user: any | null;
  token: string | null;
  setAuth: (user: any, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,

      // Fungsi untuk menyimpan data login
      setAuth: (user, token) => {
        set({ user, token });
        // Simpan juga ke cookie agar bisa dibaca oleh Middleware Next.js
        // Kita set expires 7 hari (sesuaikan dengan kebutuhan)
        const d = new Date();
        d.setTime(d.getTime() + (7 * 24 * 60 * 60 * 1000));
        document.cookie = `token=${token}; path=/; expires=${d.toUTCString()}; SameSite=Lax`;
      },

      // Fungsi untuk logout (Auto-logout akan memanggil ini)
      logout: () => {
        // 1. Reset state
        set({ user: null, token: null });
      
        // 2. Hapus Cookie (Pastikan domain/path sama persis)
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      
        // 3. Bersihkan storage
        localStorage.removeItem('auth-storage');
        sessionStorage.clear();
      
        if (typeof window !== 'undefined') {
           // Gunakan replace agar user tidak bisa 'Back' ke halaman terproteksi
           window.location.replace('/'); 
        }
      },
    }),
    {
      name: 'auth-storage', // Nama key di localStorage
    }
  )
);