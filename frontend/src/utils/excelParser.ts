import * as XLSX from 'xlsx';

const COLUMN_ALIASES: Record<string, string> = {
  partner_id: 'affiliate_id',
  partner_name: 'affiliate_name',
  affiliate: 'affiliate_id',
  player_country: 'country',
  campaign_name: 'campaign',
  stats_date: 'date',
  ftd_count: 'ftds',
  deposits_sum: 'revenue',
  partner_income: 'cost',
};

export const normalizeColumnName = (name: string): string => {
  return name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '');
};

export const parseExcelFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        let allData: any[] = [];

        workbook.SheetNames.forEach(sheetName => {
          const sheet = workbook.Sheets[sheetName];
          const rawJSON = XLSX.utils.sheet_to_json(sheet) as any[];

          const normalizedJSON = rawJSON.map(row => {
            const newRow: Record<string, any> = {};
            for (const key in row) {
              const normKey = normalizeColumnName(key);
              const aliasedKey = COLUMN_ALIASES[normKey] ?? normKey;
              newRow[aliasedKey] = row[key];
            }
            return newRow;
          });

          allData = [...allData, ...normalizedJSON];
        });

        resolve(allData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};
