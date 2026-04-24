import { format } from "date-fns";
import { id } from "date-fns/locale";

export function RecentBookingsTable({ bookings }: { bookings: any[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return "bg-amber-100 text-amber-700";
      case "EXPIRED": return "bg-slate-100 text-slate-600";
      case "PAID": return "bg-emerald-100 text-emerald-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h3 className="font-bold text-slate-900">Transaksi Terbaru</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
            <tr>
              <th className="px-6 py-4">Kode</th>
              <th className="px-6 py-4">Pelanggan</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Dibuat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {bookings.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-mono font-medium text-primary text-xs">{item.bookingCode}</td>
                <td className="px-6 py-4 font-semibold text-slate-900">{item.user.name}</td>
                <td className="px-6 py-4 font-bold">Rp {item.totalPrice.toLocaleString("id-ID")}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${getStatusColor(item.status)}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500">
                  {format(new Date(item.createdAt), "dd MMM yyyy", { locale: id })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}