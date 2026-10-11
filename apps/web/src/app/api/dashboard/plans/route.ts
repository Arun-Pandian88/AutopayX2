import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: plans } = await supabase
      .from('plans')
      .select('*')
      .order('price', { ascending: true });

    if (plans && plans.length > 0) {
      return NextResponse.json({ success: true, data: plans });
    }

    // Default plans fallback
    return NextResponse.json({
      success: true,
      data: [
        {
          id: 'plan_starter',
          name: 'Starter',
          description: 'For small merchants starting with UPI automation',
          price: 0,
          billing_cycle: 'monthly',
          features: ['Up to 500 transactions/mo', 'Direct UPI QR Code', 'Email Support'],
          transaction_limit: 500,
          fee_percentage: 0,
          status: 'active',
        },
        {
          id: 'plan_pro',
          name: 'Pro Merchant',
          description: 'For growing businesses needing higher volume & webhooks',
          price: 499,
          billing_cycle: 'monthly',
          features: ['Unlimited transactions', 'Automatic UTR Verification', 'Instant Webhooks', 'Priority Support'],
          transaction_limit: 999999,
          fee_percentage: 0,
          status: 'active',
        },
      ],
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}
