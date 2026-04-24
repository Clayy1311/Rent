// hooks/usePackages.ts
import { useState, useEffect } from "react";
import api from "@/lib/axios";

export function usePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await api.get("/package");
        // Kita ambil res.data.data karena Go Fiber biasanya membungkus dalam object data
        setPackages(res.data.data || []);
      } catch (err) {
        console.error("Error fetch packages:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  return { packages, loading };
}