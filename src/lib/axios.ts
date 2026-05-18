import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// Interceptor untuk Request (Menambahkan token otomatis)
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor untuk Response (Handle 401 / Expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika status 401, berarti token expired atau tidak valid
    if (error.response && error.response.status === 401) {
      console.warn("Token expired atau tidak valid. Melakukan logout otomatis...");
      
      // Ambil fungsi logout dari store
      const logout = useAuthStore.getState().logout; 
      
      logout(); // Bersihkan token dan data user di Zustand/LocalStorage
      
      // Redirect ke login
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;