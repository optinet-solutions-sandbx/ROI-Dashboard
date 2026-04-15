import * as XLSX from 'xlsx';
import type { PerformanceRecord } from './kpiEngine';

const COLUMN_ALIASES: Record<string, string> = {
  partner_id:     'affiliate_id',
  player_country: 'country',
  campaign_name:  'campaign',
  stats_date:     'date',
  ftd_count:      'ftds',
  deposits_sum:   'revenue',
  partner_income: 'cost',
};

export const normalizeColumnName = (name: string): string =>
  name.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/_$/, '');

export const parseBuffer = (buffer: Buffer): PerformanceRecord[] => {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  let allData: PerformanceRecord[] = [];

  workbook.SheetNames.forEach(sheetName => {
    const sheet  = workbook.Sheets[sheetName];
    const rawJSON = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    const normalized = rawJSON.map(row => {
      const newRow: PerformanceRecord = {};
      for (const key in row) {
        const normKey    = normalizeColumnName(key);
        const aliasedKey = COLUMN_ALIASES[normKey] ?? normKey;
        newRow[aliasedKey] = row[key];
      }
      return newRow;
    });

    allData = [...allData, ...normalized];
  });

  return allData;
};
