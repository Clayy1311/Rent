import api from "@/lib/axios";

export const downloadReport = async (from: string, to: string) => {
  // GANTI 'download' MENJADI 'donwload' SESUAI POSTMAN
  const response = await api.get(`/admin/reports/donwload`, { 
    params: { from, to },
    responseType: "blob", 
  });

  // Logic download otomatis di browser
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  
  // Penamaan file (opsional, sesuaikan dengan extension dari backend)
  link.setAttribute("download", `Report-Azka-Outdoor-${from}-to-${to}.xlsx`); 
  
  document.body.appendChild(link);
  link.click();
  link.remove();
};