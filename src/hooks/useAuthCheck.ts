import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import api from "@/lib/axios";

export function useAuthCheck() {
  const { user, token, logout, setAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const verifySession = useCallback(async () => {
    if (!token) return;
    try {
      const response = await api.get("/auth/me");
      if (!user && response.data.data) {
        setAuth(response.data.data, token);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
      }
    }
  }, [token, user, setAuth, logout]);

  useEffect(() => {
    if (mounted) verifySession();
  }, [mounted, verifySession]);

  useEffect(() => {
    if (!mounted) return;
    const checkCookie = () => {
      const hasToken = document.cookie.includes("token=");
      if (token && !hasToken) logout();
    };
    window.addEventListener("focus", checkCookie);
    const interval = setInterval(checkCookie, 2000);
    return () => {
      window.removeEventListener("focus", checkCookie);
      clearInterval(interval);
    };
  }, [mounted, token, logout]);

  return { mounted, user, token, logout };
}