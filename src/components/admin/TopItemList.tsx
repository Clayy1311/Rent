export function TopItemsList({ items }: { items: any[] }) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-900 mb-6">Barang Terlaris</h3>
        <div className="space-y-6">
          {items.map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{item.name}</span>
                <span className="font-bold text-primary">{item.count} Kali</span>
              </div>
              {/* Simple Bar Chart */}
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full" 
                  style={{ width: `${(item.count / items[0].count) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }