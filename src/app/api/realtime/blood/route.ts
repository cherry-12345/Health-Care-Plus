import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RealTimeDataManager } from '@/lib/realtime';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { hospitalId, bloodGroup, units } = await request.json();

    if (!hospitalId || !bloodGroup || units === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedBlood = await RealTimeDataManager.updateBloodInventory(
      hospitalId,
      bloodGroup,
      units
    );

    return NextResponse.json({
      success: true,
      data: updatedBlood,
      message: 'Blood inventory updated successfully'
    });
  } catch (error) {
    console.error('Blood update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update blood inventory' },
      { status: 500 }
    );
  }
}