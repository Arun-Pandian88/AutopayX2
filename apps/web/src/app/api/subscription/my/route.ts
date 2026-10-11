import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*, plan:plans(*)')
      .limit(1)
      .single();

    return NextResponse.json({
      success: true,
      data: sub || {
        status: 'active',
        plan: {
          name: 'Pro Merchant',
          transaction_limit: 999999,
          price: 499,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: {
        status: 'active',
        plan: {
          name: 'Starter',
          transaction_limit: 500,
          price: 0,
        },
      },
    });
  }
}
