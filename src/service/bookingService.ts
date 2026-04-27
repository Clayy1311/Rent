import api from "@/lib/axios";
export const bookingService = {
  getAllBookings: async (params: any) => {
    const response = await api.get("/admin/allBookings", { params });
    return response.data;
  }
};