import { ApiResponse, Item , Category} from "@/types";

export const getItems = async (): Promise<Item[]> => {
  const response = await fetch("http://localhost:3001/items");
  if (!response.ok) {
    throw new Error("Gagal mengambil data item");
  }
  const result: ApiResponse<Item[]> = await response.json();
  return result.data; // Kita ambil properti .data nya saja
};
export const getCategories = async (): Promise<Category[]> => {
    const response = await fetch("http://localhost:3001/category"); // Sesuaikan URL-nya
    if (!response.ok) throw new Error("Gagal ambil kategori");
    const result: ApiResponse<Category[]> = await response.json();
    return result.data;
  };