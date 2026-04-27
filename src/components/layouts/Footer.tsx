"use client";

import Link from "next/link";
import { 
  Mail, 
  MapPin, 
  Phone, 
  Mountain, 
  MessageCircle, 
  Globe,
  ArrowUpRight 
} from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white pt-24 pb-12 rounded-t-[50px] md:rounded-t-[80px]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          
          {/* Brand & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-xl">
                <Mountain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase italic">
                Azka<span className="text-blue-500 underline decoration-2 underline-offset-4">Outdoor</span>
              </span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Partner setia petualanganmu di Malang Raya. Kami menyediakan perlengkapan outdoor berkualitas untuk mahasiswa dan pendaki umum.
            </p>
            {/* Social Icons diganti ke yang Aman & Fungsional */}
            <div className="flex gap-4">
              <Link href="#" className="p-3 bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all group">
                <MessageCircle className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </Link>
              <Link href="#" className="p-3 bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all group">
                <Globe className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </Link>
              <Link href="#" className="p-3 bg-slate-900 rounded-2xl hover:bg-blue-600 transition-all group">
                <Mail className="w-5 h-5 text-slate-400 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Navigasi */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-500 italic">Navigasi</h4>
            <ul className="space-y-4">
              {["Beranda", "Katalog Alat", "Paket Bundling", "Syarat Sewa"].map((link) => (
                <li key={link}>
                  <Link href="#" className="group flex items-center text-slate-400 hover:text-white transition-all text-sm font-bold">
                    {link} <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kategori */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-500 italic">Kategori</h4>
            <ul className="space-y-4">
              {["Tenda", "Carrier", "Alat Masak", "Sleeping Bag"].map((cat) => (
                <li key={cat}>
                  <Link href="#" className="text-slate-400 hover:text-white transition-all text-sm font-bold">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kontak */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest mb-8 text-blue-500 italic">Kontak</h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-slate-400 text-sm font-medium leading-relaxed">
                  Lowokwaru, Kota Malang, Jawa Timur
                </span>
              </li>
              <li className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-blue-500 shrink-0" />
                <span className="text-slate-400 text-sm font-medium">+62 812-xxxx-xxxx</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            © {currentYear} AZKA OUTDOOR - DEV BY <span className="text-slate-300">RIZAL FAHMI</span>
          </p>
        </div>
      </div>
    </footer>
  );
}