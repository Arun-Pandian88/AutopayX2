import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createClient();
    const { data: links, error } = await supabase
      .from('payment_links')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: links || [],
    });
  } catch (err: any) {
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const slug = body.slug || 'pay_' + Math.random().toString(36).substring(2, 9);

    const { data, error } = await supabase
      .from('payment_links')
      .insert([{ ...body, slug }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
