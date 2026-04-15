import { NextRequest, NextResponse } from 'next/server';
import { parseBuffer } from '@/utils/excelParser';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls') && !name.endsWith('.csv')) {
    return NextResponse.json(
      { error: 'Invalid file type. Upload .xlsx, .xls, or .csv' },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer      = Buffer.from(arrayBuffer);
  const data        = parseBuffer(buffer);

  return NextResponse.json({ data });
}
