import { useState, useEffect } from "react";
import { getItems, getCategories } from "@/service/itemService";
import { Item, Category } from "@/types";

export const useItems = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mengambil data secara paralel (lebih cepat)
      const [itemsData, categoriesData] = await Promise.all([
        getItems(),
        getCategories(),
      ]);

      console.log("data ktegori",getCategories)
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Gagal memuat data dari server. Pastikan backend sudah menyala.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Kita return refetch agar kita bisa panggil fungsi refresh data dari komponen jika perlu
  return { 
    items, 
    categories, 
    loading, 
    error, 
    refetch: fetchAllData 
  };
};