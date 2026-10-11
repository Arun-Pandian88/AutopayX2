import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    await supabase
      .from('payment_settings')
      .update({ is_connected: false, mailbox_email: '' })
      .eq('app_name', body.app_name);

    return NextResponse.json({ success: true, message: 'Mailbox disconnected' });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
