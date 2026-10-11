import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const APPS = ['Google Pay', 'PhonePe', 'Paytm', 'FamPay', 'Personal UPI (Auto-Verify)'];

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: settings } = await supabase
      .from('payment_settings')
      .select('*');

    const dbList = Array.isArray(settings) ? settings : [];

    const result = APPS.map((app) => {
      const match = dbList.find((s: any) => s.app_name === app);
      return (
        match || {
          app_name: app,
          master_upi_id: '',
          upi_number: '',
          payee_name: '',
          merchant_id: '',
          mailbox_email: '',
          is_connected: false,
          auto_routing_enabled: true,
          routing_upi_list: [],
        }
      );
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const fallback = APPS.map((app) => ({
      app_name: app,
      master_upi_id: '',
      upi_number: '',
      payee_name: '',
      merchant_id: '',
      mailbox_email: '',
      is_connected: false,
      auto_routing_enabled: true,
      routing_upi_list: [],
    }));
    return NextResponse.json(fallback);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();

    const { data, error } = await supabase
      .from('payment_settings')
      .upsert([body])
      .select();

    return NextResponse.json({ success: true, message: 'Settings saved', data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
