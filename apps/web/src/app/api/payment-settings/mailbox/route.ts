import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data } = await supabase
      .from('payment_settings')
      .upsert([{ ...body, is_connected: true }])
      .select();

    return NextResponse.json({ success: true, message: 'Mailbox connected successfully', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
