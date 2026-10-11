import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: txns, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: txns || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('transactions')
      .insert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
