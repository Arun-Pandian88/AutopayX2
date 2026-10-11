import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data } = await supabase
      .from('payment_settings')
      .upsert([body])
      .select();

    return NextResponse.json({ success: true, message: 'Details saved successfully', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
