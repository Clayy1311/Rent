"use client";

import { useBookings } from "@/hooks/useBooking";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AdminBookingsPage() {
  const { data, loading, meta, handleSearch, handleStatusFilter, handlePageChange, filters } = useBookings();

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Manajemen Pesanan</h1>
          <p className="text-slate-500 text-sm">Kelola semua transaksi penyewaan Azka Outdoor.</p>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex gap-4 items-center">
        <Input 
          placeholder="Cari Kode Booking atau Nama User..." 
          className="max-w-md rounded-xl"
          onChange={(e) => handleSearch(e.target.value)}
        />
        
        <Select onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-[200px] rounded-xl">
            <SelectValue placeholder="Semua Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Status</SelectItem>
            <SelectItem value="WAITING_CONFIRMATION">Menunggu Konfirmasi</SelectItem>
            <SelectItem value="PAID">Sudah Bayar</SelectItem>
            <SelectItem value="PICKED_UP">Diambil</SelectItem>
            <SelectItem value="RETURNED">Kembali</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="border rounded-[30px] overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[11px]">Kode</TableHead>
              <TableHead className="font-bold uppercase text-[11px]">Penyewa</TableHead>
              <TableHead className="font-bold uppercase text-[11px]">Status</TableHead>
              <TableHead className="font-bold uppercase text-[11px]">Total</TableHead>
              <TableHead className="text-right font-bold uppercase text-[11px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Loading data...</TableCell></TableRow>
            ) : data.length > 0 ? (
              data.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-mono font-bold text-blue-600">{booking.bookingCode}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold">{booking.user.name}</span>
                      <span className="text-[10px] text-slate-400">{booking.user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={booking.status === 'PAID' ? 'default' : 'outline'} className="rounded-full">
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold">Rp {booking.totalPrice?.toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="font-bold text-blue-600">Detail →</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={5} className="text-center py-10">Tidak ada pesanan ditemukan.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION CONTROL */}
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-500 font-medium">Total: {meta.totalData} Pesanan</p>
        <div className="flex gap-2">
          <Button 
            disabled={filters.page === 1} 
            onClick={() => handlePageChange(filters.page - 1)}
            variant="outline" size="sm" className="rounded-xl"
          >
            Prev
          </Button>
          <span className="flex items-center px-4 text-sm font-bold">{meta.currentPage} / {meta.totalPages}</span>
          <Button 
            disabled={filters.page === meta.totalPages} 
            onClick={() => handlePageChange(filters.page + 1)}
            variant="outline" size="sm" className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}