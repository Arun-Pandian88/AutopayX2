import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'Today';

    const supabase = createClient();
    const { data: txns, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    const allTxns = txns || [];
    const totalOrders = allTxns.length;
    const successTxns = allTxns.filter((t: any) => t.status === 'completed' || t.status === 'success');
    const totalRevenue = successTxns.reduce((acc: number, t: any) => acc + (parseFloat(t.amount) || 0), 0);
    const pendingCount = allTxns.filter((t: any) => t.status === 'pending' || t.status === 'processing').length;
    const failedCount = allTxns.filter((t: any) => t.status === 'failed').length;
    const successRate = totalOrders > 0 ? parseFloat(((successTxns.length / totalOrders) * 100).toFixed(1)) : 100;

    const todayStr = new Date().toISOString().split('T')[0];
    const chartData = [
      { date: todayStr, revenue: totalRevenue, orders: totalOrders }
    ];

    const stats = {
      totalRevenue,
      totalOrders,
      successRate,
      pending: pendingCount,
      failed: failedCount,
      chartData,
      recentTransactions: allTxns.slice(0, 5),
      paymentMethods: {
        UPI: 100,
        Cards: 0,
        Netbanking: 0,
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: 0,
        totalOrders: 0,
        successRate: 100,
        pending: 0,
        failed: 0,
        chartData: [{ date: new Date().toISOString().split('T')[0], revenue: 0, orders: 0 }],
        recentTransactions: [],
        paymentMethods: { UPI: 100, Cards: 0, Netbanking: 0 },
      },
    });
  }
}
