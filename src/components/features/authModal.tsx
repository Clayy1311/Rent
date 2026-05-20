"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useAuthStore } from "@/store/useAuthStore";
import { Mountain, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // REGISTER
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const endpoint = isLogin
        ? "http://localhost:3001/auth/login"
        : "http://localhost:3001/auth/register";

      const body = isLogin
        ? { email, password }
        : { name, email, phone, address, password };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Gagal");
      }

      // LOGIN SAJA yang simpan auth
      if (isLogin) {
        const userData = result.data?.user || result.user;
        const tokenData = result.data?.token || result.token;

        setAuth(userData, tokenData);

        document.cookie = `token=${tokenData}; path=/; max-age=604800`;
        document.cookie = `userRole=${userData.role}; path=/; max-age=604800`;

        toast.success(`Welcome ${userData.name}`);
        onClose();

        setTimeout(() => {
          if (userData.role?.toLowerCase() === "admin") {
            router.push("/admin");
          } else {
            window.location.href = "/";
          }
        }, 500);
      } else {
        toast.success("Registrasi berhasil!", {
          description: "Silakan cek email kamu untuk verifikasi akun.",
        });

        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] z-[100] bg-slate-950 border border-slate-800 text-white rounded-2xl shadow-2xl">
        {/* HEADER */}
        <DialogHeader className="items-center">
          <div className="p-3 bg-primary/10 rounded-2xl mb-2">
            <Mountain className="h-8 w-8 text-primary" />
          </div>

          <DialogTitle className="text-2xl font-black tracking-tight text-center">
            {isLogin ? "Welcome Back" : "Create Account"}
          </DialogTitle>

          <p className="text-xs text-slate-400 text-center">
            {isLogin
              ? "Masuk untuk melanjutkan booking"
              : "Daftar untuk mulai sewa alat outdoor"}
          </p>
        </DialogHeader>

        {/* ERROR */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/20 text-red-400 rounded-xl">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* REGISTER FIELD */}
          {!isLogin && (
            <>
              <Input
                placeholder="Nama Lengkap"
                className="bg-slate-900 border-slate-800 h-12 rounded-xl"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <Input
                placeholder="No HP"
                className="bg-slate-900 border-slate-800 h-12 rounded-xl"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />

              <Input
                placeholder="Alamat"
                className="bg-slate-900 border-slate-800 h-12 rounded-xl"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </>
          )}

          {/* EMAIL */}
          <Input
            type="email"
            placeholder="Email"
            className="bg-slate-900 border-slate-800 h-12 rounded-xl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* PASSWORD */}
          <Input
            type="password"
            placeholder="Password"
            className="bg-slate-900 border-slate-800 h-12 rounded-xl"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* BUTTON */}
          <Button
            className="w-full h-12 rounded-xl font-bold text-sm mt-2"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : isLogin ? (
              "Login"
            ) : (
              "Register"
            )}
          </Button>
        </form>

        {/* SWITCH */}
        <div className="text-center pt-4 text-sm">
          <span className="text-slate-500">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
          </span>{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Daftar" : "Login"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
