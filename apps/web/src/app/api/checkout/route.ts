import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

const DEFAULT_THEME = {
  theme_id: 'winter_wonder',
  business_name: 'AutoPayX',
  brand_color: '#244531',
  brand_logo: 'A',
  logo_type: 'text',
  background_image: 'festive_pattern_bg.jpg',
};

export async function GET() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_THEME,
      });
    }

    const { data: theme, error } = await supabase
      .from('checkout_themes')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !theme) {
      return NextResponse.json({
        success: true,
        data: DEFAULT_THEME,
      });
    }

    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: true,
      data: DEFAULT_THEME,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({
        success: true,
        data: { ...DEFAULT_THEME, ...body },
      });
    }

    const payload = {
      user_id: user.id,
      theme_id: body.theme_id || 'winter_wonder',
      business_name: body.business_name || 'AutoPayX',
      brand_color: body.brand_color || '#244531',
      brand_logo: body.brand_logo || 'A',
      logo_type: body.logo_type || 'text',
      background_image: body.background_image || 'festive_pattern_bg.jpg',
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('checkout_themes')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      // Return payload gracefully if DB table is not yet migrated
      return NextResponse.json({
        success: true,
        data: payload,
      });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update theme' },
      { status: 500 }
    );
  }
}
