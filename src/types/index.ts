export interface Category {
    id: number;
    name: string;
    items?: []; // Tambahkan ini karena backend mengirimkan array items di dalam kategori
  }
  // 2. Definisi Item (Alat Outdoor)
  export interface Item {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    categoryId: number | null; // Bisa null jika item tidak punya kategori
  }
  export interface PackageItem {
    id: number;
    quantity: number;
    item: {
      id: number;
      name: string;
      price: number;
      image: string;
      category?: { name: string } | null;
    };
  }
  
  export interface Package {
    id: number;
    package_name: string;
    description: string;
    min_capacity: number;
    max_capacity: number;
    originalPrice: number;
    final_price: number;
    package_items: PackageItem[];
  }
  
  // 3. Wrapper untuk Response API dari Backend
  // Ini berguna karena backend-mu membungkus data dalam properti "data"
  export interface ApiResponse<T> {
    message: string;
    data: T;
  }
  
  // 4. Struktur Item yang ada di dalam Keranjang (Zustand)
  // Kita meng-extend Item asli dan menambahkan properti quantity
  export interface CartItem extends Item {
    quantity: number;
  }