import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RealTimeDataManager } from '@/lib/realtime';

export async function GET() {
  try {
    await connectDB();
    const dashboardData = await RealTimeDataManager.getDashboardData();
    
    return NextResponse.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch dashboard data';
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        data: null 
      },
      { status: 500 }
    );
  }
}