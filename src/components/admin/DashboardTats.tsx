import { DollarSign, Package, Clock } from "lucide-react";

export function DashboardStats({ summary }: { summary: any }) {
  const stats = [
    {
      label: "Total Pendapatan",
      value: `Rp ${summary.totalRevenue.toLocaleString("id-ID")}`,
      icon: <DollarSign className="text-emerald-500" />,
      bg: "bg-emerald-500/10",
    },
    {
      label: "Sewa Aktif",
      value: summary.activeRentals,
      icon: <Package className="text-blue-500" />,
      bg: "bg-blue-500/10",
    },
    {
      label: "Menunggu Pembayaran",
      value: summary.pendingOrders,
      icon: <Clock className="text-amber-500" />,
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, i) => (
        <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl ${stat.bg}`}>{stat.icon}</div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}