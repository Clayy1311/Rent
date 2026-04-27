"use client";

import { useState } from "react";
import { Package, Layers, Plus } from "lucide-react";
import { cn } from "../../../../lib/utils";
import { ProductTable } from "@/components/admin/ProductTable";
import { PackageTable } from "@/components/admin/PackageTable";
import { CreateItemModal } from "@/components/admin/CreateItemModal";
import { CreatePackageModal } from "@/components/admin/CreatePackageModal";

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"PRODUCT" | "PACKAGE">("PRODUCT");
  
  // State untuk kontrol masing-masing modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  
  // State untuk mentrigger refresh data tabel tanpa reload satu halaman
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Fungsi untuk handle klik tombol "Tambah" sesuai tab aktif
  const handleAddClick = () => {
    if (activeTab === "PRODUCT") {
      setIsItemModalOpen(true);
    } else {
      setIsPackageModalOpen(true);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Inventori <span className="text-blue-600">{activeTab === "PRODUCT" ? "Produk" : "Paket"}</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            Kelola stok unit alat dan paket bundling hemat Azka Outdoor.
          </p>
        </div>
        
        <button 
          onClick={handleAddClick}
          className="bg-slate-950 hover:bg-blue-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-[0.2em] transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={16} className="inline mr-2" /> 
          Tambah {activeTab === "PRODUCT" ? "Item Baru" : "Paket Baru"}
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex p-1 bg-slate-100 w-fit rounded-[24px] border border-slate-200/50">
        <TabButton 
          active={activeTab === "PRODUCT"} 
          onClick={() => setActiveTab("PRODUCT")} 
          icon={<Package size={16}/>} 
          label="Item Alat" 
        />
        <TabButton 
          active={activeTab === "PACKAGE"} 
          onClick={() => setActiveTab("PACKAGE")} 
          icon={<Layers size={16}/>} 
          label="Paket Bundling" 
        />
      </div>

      {/* TABLE CONTAINER */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[400px]">
        <div className="overflow-x-auto">
          {activeTab === "PRODUCT" ? (
            <ProductTable key={`prod-${refreshKey}`} />
          ) : (
            <PackageTable key={`pkg-${refreshKey}`} />
          )}
        </div>
      </div>

      {/* MODAL UNTUK TAMBAH SINGLE ITEM */}
      <CreateItemModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* MODAL UNTUK TAMBAH PAKET BUNDLING */}
      <CreatePackageModal 
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}

/**
 * Sub-komponen TabButton 
 * Dipisah di bawah agar kode utama InventoryPage tetap ringkas
 */
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean, 
  onClick: () => void, 
  icon: React.ReactNode, 
  label: string 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-8 py-3 rounded-[20px] text-[10px] font-black uppercase italic transition-all duration-300 tracking-widest",
        active 
          ? "bg-white text-slate-950 shadow-md shadow-slate-200/50 scale-100" 
          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
      )}
    >
      <span className={cn("transition-colors", active ? "text-blue-600" : "text-slate-400")}>
        {icon}
      </span>
      {label}
    </button>
  );
}