import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ambil fungsi logout dari store tanpa menggunakan hook (langsung ke state)
      useAuthStore.getState().logout(); 
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;