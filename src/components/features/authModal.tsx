"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "@/store/useAuthStore";
import { Mountain, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner"; 

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State Input
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || "Gagal Login");
      }
  
      // 1. Ambil data user & token dari response backendmu
      // Pastikan strukturnya sesuai: result.data.user atau result.user
      const userData = result.data?.user || result.user;
      const tokenData = result.data?.token || result.token;
  
      // 2. Simpan ke Zustand (Zustand biasanya otomatis ke localStorage jika dipersist)
      setAuth(userData, tokenData);
  
      // 3. Simpan ke COOKIE agar Middleware bisa akses (Server-side)
      document.cookie = `token=${tokenData}; path=/; max-age=604800; SameSite=Lax`;
  
      toast.success(`Selamat datang kembali, ${userData.name}!`);
      onClose();
  
      // 4. LOGIKA REDIRECT BERDASARKAN ROLE
      // Gunakan setTimeout sedikit agar toast sempat terlihat sebelum pindah halaman
// 4. LOGIKA REDIRECT BERDASARKAN ROLE
setTimeout(() => {
    // Gunakan toLowerCase() supaya mau ADMIN, Admin, atau admin tetap masuk
    if (userData.role?.toLowerCase() === "admin") {
      console.log("Redirecting to Admin Dashboard...");
      router.push("/admin");
    } else {
      console.log("Redirecting to Home...");
      window.location.href = "/"; 
    }
  }, 500);
  
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-slate-950 border-slate-800 text-white shadow-2xl">
        <DialogHeader className="items-center pb-4">
          <div className="p-3 bg-primary/10 rounded-2xl mb-2">
            <Mountain className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tighter">
            {isLogin ? "Selamat Datang!" : "Gabung Azka Outdoor"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Email Address</label>
            <Input 
              type="email" 
              placeholder="admin@gmail.com" 
              className="bg-slate-900 border-slate-800 h-12 rounded-xl focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              className="bg-slate-900 border-slate-800 h-12 rounded-xl focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <Button className="w-full h-12 rounded-xl font-bold text-md mt-4 transition-all active:scale-95" disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : (isLogin ? "Masuk ke Akun" : "Daftar Sekarang")}
          </Button>
        </form>

        <div className="text-center pt-6 text-sm">
          <span className="text-slate-500">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
          </span>{" "}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-primary font-bold hover:underline"
          >
            {isLogin ? "Daftar" : "Login"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}