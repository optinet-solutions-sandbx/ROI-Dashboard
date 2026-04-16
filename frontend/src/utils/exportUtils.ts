import * as XLSX from 'xlsx';

/** Download data as a CSV file using the xlsx library. */
export function downloadCSV(rows: Record<string, any>[], filename: string): void {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data');
  XLSX.writeFile(wb, filename.endsWith('.csv') ? filename : `${filename}.csv`);
}
