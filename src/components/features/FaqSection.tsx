"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "Gimana kalau alat yang saya sewa rusak atau hilang?",
    answer: "Penyewa bertanggung jawab penuh atas kondisi alat. Jika rusak ringan akan dikenakan biaya servis, namun jika rusak berat atau hilang, penyewa wajib mengganti sesuai harga pasaran atau unit yang sama.",
  },
  {
    question: "Apakah bisa ambil alat di luar jam operasional?",
    answer: "Normalnya pengambilan dilakukan pada jam 08.00 - 20.00 WIB. Untuk pengambilan di luar jam tersebut, harap konfirmasi admin minimal H-1 ya, Prof!",
  },
  {
    question: "Berapa lama durasi minimal sewa di Azka Outdoor?",
    answer: "Minimal sewa adalah 1 hari (24 jam). Jika lewat dari jam pengembalian yang disepakati, akan dikenakan denda sesuai tarif per jam atau per hari.",
  },
  {
    question: "Apa saja syarat dokumen untuk menyewa?",
    answer: "Cukup tinggalkan kartu identitas asli (E-KTP/SIM/KTM) yang masih berlaku sebagai jaminan selama masa penyewaan.",
  },
  {
    question: "Bisa pesan lewat website tapi bayar di tempat (COD)?",
  answer: "Bisa. Kamu dapat mengecek ketersediaan alat terlebih dahulu melalui website, lalu datang langsung ke toko untuk melakukan pembayaran secara tunai (cash) dan mengambil barang yang telah dipesan."
  },
];

export function FaqSection() {
  return (
    <section className="container mx-auto px-6 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Sisi Kiri: Judul & Deskripsi */}
        <div className="sticky top-32">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-blue-600 font-black uppercase tracking-widest text-[10px]">Pertanyaan Umum</h4>
          </div>
          <h2 className="text-4xl font-black text-slate-950 tracking-tighter uppercase italic mb-6">
            Ada yang <br /> Kurang Jelas?
          </h2>
          <p className="text-slate-500 text-sm max-w-md leading-relaxed">
            Kami kumpulkan pertanyaan yang paling sering ditanyakan para pendaki. Kalau belum nemu jawabannya, langsung gas tanya admin via WhatsApp aja!
          </p>
          
          <div className="mt-10 p-6 bg-slate-50 rounded-[30px] border border-slate-100">
            <p className="text-xs font-bold text-slate-400 mb-2 uppercase italic">Butuh bantuan cepat?</p>
            <a href="#" className="text-slate-950 font-black text-lg hover:text-blue-600 transition-colors">
              Hubungi CS Azka →
            </a>
          </div>
        </div>

        {/* Sisi Kanan: Accordion FAQ */}
        <div className="bg-white rounded-[40px]">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-slate-100 rounded-3xl px-6 py-2 data-[state=open]:border-blue-200 data-[state=open]:bg-blue-50/30 transition-all"
              >
                <AccordionTrigger className="hover:no-underline font-bold text-slate-950 text-left text-sm md:text-base py-4">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 text-sm leading-relaxed pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
}