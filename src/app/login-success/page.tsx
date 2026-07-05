"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const name = searchParams.get("name");
    const id = searchParams.get("id");

    // 1. UPDATE: Pastikan variabel 'id' juga ikut divalidasi di sini
    if (token && role && name && id) {
      
      // 2. Antisipasi tipe data: Konversi ke Number jika ID aslinya angka di database,
      // jika di DB menggunakan string (UUID), gunakan langsung variabel 'id'
      const userId = isNaN(Number(id)) ? id : Number(id);

      // 3. Simpan objek user utuh (termasuk id yang sudah dikonversi) ke Zustand
      setAuth({ id: userId, name: decodeURIComponent(name), role }, token);

      // 4. Simpan ke Cookie agar aman
      document.cookie = `token=${token}; path=/; max-age=604800`;
      document.cookie = `userRole=${role}; path=/; max-age=604800`;

      // 5. Tampilkan notifikasi sukses
      toast.success(`Welcome back, ${decodeURIComponent(name)}!`);

      // 6. Redirect berdasarkan role
      setTimeout(() => {
        if (role.toLowerCase() === "admin") {
          router.push("/admin");
        } else {
          // Gunakan window.location.href agar halaman utama me-refresh total 
          // dan membaca state Zustand yang paling baru dari cookies/localStorage
          window.location.href = "/";
        }
      }, 800);
    } else {
      // Jika salah satu parameter (termasuk ID) hilang, lempar error
      toast.error("Data login tidak valid atau ID pengguna hilang");
      router.push("/");
    }
  }, [searchParams, setAuth, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-slate-400 font-medium animate-pulse">
        Menyelaraskan akun Google kamu...
      </p>
    </div>
  );
}