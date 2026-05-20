"use client";

import { useEffect, useState } from "react";
import { Users, RefreshCw, Search, User, Phone, MapPin, Mail } from "lucide-react";
import api from "@/lib/axios";

type UserType = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/admin/users");
      const dataUsers = res.data?.data || res.data;

      setUsers(Array.isArray(dataUsers) ? dataUsers : []);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil data users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const filteredUsers = users.filter((u) =>
    `${u.name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950 tracking-tight uppercase italic">
            Daftar <span className="text-blue-600">Pengguna</span>
          </h1>
          <p className="text-slate-500 font-medium italic">
            Kelola data user yang terdaftar di dalam ekosistem sistem.
          </p>
        </div>

        <div className="flex gap-3 items-center self-start sm:self-auto">
          <span className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-700 border border-slate-200/50">
            Total: {users.length}
          </span>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-slate-950 hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={12} className={`inline ${loading ? 'animate-spin' : ''}`} /> Refresh Data
          </button>
        </div>
      </div>

      {/* SEARCH BAR SECTION */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3 group focus-within:border-blue-600/50 transition-all">
        <Search size={18} className="text-slate-400 group-focus-within:text-blue-600 transition-colors" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="CARI NAMA ATAU EMAIL USER..."
          className="w-full outline-none text-xs font-bold uppercase tracking-wider text-slate-800 placeholder:text-slate-300"
        />
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wide p-4 rounded-2xl animate-shake">
          ⚠️ {error}
        </div>
      )}

      {/* TABLE SECTION */}
      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-sm min-h-[300px]">
        {loading ? (
          /* Custom Loader Match Style */
          <div className="flex justify-center items-center h-[300px]">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5">User / Pelanggan</th>
                  <th className="px-8 py-5">Kontak Email</th>
                  <th className="px-8 py-5">No. Telepon</th>
                  <th className="px-8 py-5">Alamat Domisili</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      {/* USER COLUMN */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black italic text-xs group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm ring-1 ring-slate-200/50 group-hover:ring-blue-600">
                            {getInitials(user.name)}
                          </div>
                          <span className="font-black text-slate-900 uppercase italic tracking-tighter text-base">
                            {user.name}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL COLUMN */}
                      <td className="px-8 py-5 font-medium text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail size={14} className="text-slate-300" />
                          <span>{user.email}</span>
                        </div>
                      </td>

                      {/* PHONE COLUMN */}
                      <td className="px-8 py-5">
                        {user.phone ? (
                          <div className="flex items-center gap-2 text-slate-700 font-mono text-xs font-bold bg-slate-50 px-2.5 py-1 rounded-lg w-fit border border-slate-100">
                            <Phone size={12} className="text-slate-400" />
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold italic text-xs uppercase tracking-wider">
                            TIDAK ADA
                          </span>
                        )}
                      </td>

                      {/* ADDRESS COLUMN */}
                      <td className="px-8 py-5 text-slate-500 max-w-xs truncate font-medium">
                        {user.address ? (
                          <div className="flex items-center gap-2 truncate">
                            <MapPin size={14} className="text-slate-400 shrink-0" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold italic text-xs uppercase tracking-wider">
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  /* EMPTY STATE MATCH STYLE */
                  <tr>
                    <td
                      colSpan={4}
                      className="px-8 py-20 text-center text-slate-400 font-bold italic uppercase text-xs tracking-widest"
                    >
                      <Users className="mx-auto mb-3 opacity-20" size={40} />
                      Tidak ada data user ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}