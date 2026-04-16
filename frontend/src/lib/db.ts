import { supabase } from './supabase'
import type { PerformanceRecord } from '../utils/kpiEngine'

const TABLE = 'performance_records'

// Only these columns exist in the DB schema
const COLUMNS = ['affiliate_id', 'country', 'campaign', 'date', 'clicks', 'registrations', 'ftds', 'revenue', 'cost'] as const

function toRow(record: PerformanceRecord) {
  const row: Record<string, unknown> = {}
  COLUMNS.forEach(col => {
    if (record[col] !== undefined) row[col] = record[col]
  })
  return row
}

/** Load all saved records from Supabase */
export async function fetchRecords(): Promise<PerformanceRecord[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(COLUMNS.join(', '))
    .order('id', { ascending: true })

  if (error) throw error
  return (data ?? []) as PerformanceRecord[]
}

/** Replace all records with a new dataset (batched to handle large files) */
export async function replaceRecords(records: PerformanceRecord[]): Promise<void> {
  const { error: delError } = await supabase
    .from(TABLE)
    .delete()
    .gte('id', 0)

  if (delError) throw delError

  const BATCH_SIZE = 500
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE).map(toRow)
    const { error } = await supabase.from(TABLE).insert(batch)
    if (error) throw error
  }
}
