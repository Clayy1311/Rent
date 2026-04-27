import { useState, useEffect, useCallback } from "react";
import { bookingService } from "@/service/bookingService";
import { debounce } from "lodash"; // Optional: biar search gak nembak API terus-menerus

export const useBookings = (initialLimit = 10) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ totalData: 0, totalPages: 0, currentPage: 1 });
  
  const [filters, setFilters] = useState({
    page: 1,
    limit: initialLimit,
    status: "",
    search: ""
  });

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getAllBookings(filters);
      setData(res.bookings);
      setMeta(res.meta);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  fetchBookings();
}, [filters.page, filters.status, filters.limit, filters.search]); // Fetch ulang jika filter berubah

  // Fungsi khusus Search dengan Debounce agar lebih enteng
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return {
    data,
    loading,
    meta,
    filters,
    handleSearch,
    handleStatusFilter,
    handlePageChange,
    refresh: fetchBookings
  };
};