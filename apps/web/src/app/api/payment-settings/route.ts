import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      data: settings || {
        upi_id: 'merchant@upi',
        payee_name: 'AutoPayX Merchant',
        verification_mode: 'auto',
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: {
        upi_id: 'merchant@upi',
        payee_name: 'AutoPayX Merchant',
        verification_mode: 'auto',
      },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const { data, error } = await supabase
      .from('payment_settings')
      .upsert([body])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
