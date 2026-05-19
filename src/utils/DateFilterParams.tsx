import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear 
} from "date-fns";


export function DateFilterHelper(
    type: "hari"|"minggu"|"bulan"|"tahun"
){
const hariIni = new Date();
let fromDate: Date = hariIni;
let toDate: Date = hariIni;

switch(type){
    case "hari":
        fromDate = hariIni;
        toDate = hariIni;
        break;

    case "minggu":
        fromDate = startOfWeek(hariIni,{weekStartsOn: 1});
        toDate = endOfWeek(hariIni,{weekStartsOn: 1});
        break;

    case "bulan":
        fromDate =  startOfMonth(hariIni)
        toDate = endOfMonth(hariIni);
        break;
     case "tahun":
        fromDate = startOfYear(hariIni);
        toDate = endOfYear(hariIni);
}return {
    from: format(fromDate, "yyyy-MM-dd"),
    to: format(toDate, "yyyy-MM-dd"),
  };
};