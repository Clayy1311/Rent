import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  startOfDay,
  endOfYear,
  format,
  endOfDay,
} from "date-fns";

export function DateFilterHelper(
  type: "hari" | "minggu" | "bulan" | "tahun"
) {
  const now = new Date();

  let fromDate: Date;
  let toDate: Date;

  switch (type) {
    case "hari":
      fromDate = startOfDay(now);
      toDate = endOfDay(now);
      break;

    case "minggu":
      fromDate = startOfWeek(now, { weekStartsOn: 1 });
      toDate = endOfWeek(now, { weekStartsOn: 1 });
      break;

    case "bulan":
      fromDate = startOfMonth(now);
      toDate = endOfMonth(now);
      break;

    case "tahun":
      fromDate = startOfYear(now);
      toDate = endOfYear(now);
      break;
  }

  return {
    // 🔥 FIX: kirim DATE DOANG (NO TIMEZONE, NO ISO)
    from: format(fromDate, "yyyy-MM-dd"),
    to: format(toDate, "yyyy-MM-dd"),
  };
}