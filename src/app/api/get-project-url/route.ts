import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  if (!supabaseUrl) {
    return NextResponse.json(
      { error: 'Supabase URL not configured' },
      { status: 500 }
    );
  }

  return NextResponse.json({ data: supabaseUrl });
} 