import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { RealTimeDataManager } from '@/lib/realtime';

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    const { hospitalId, bedType, occupied } = await request.json();

    if (!hospitalId || !bedType || occupied === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedBeds = await RealTimeDataManager.updateBedAvailability(
      hospitalId,
      bedType,
      occupied
    );

    return NextResponse.json({
      success: true,
      data: updatedBeds,
      message: 'Bed availability updated successfully'
    });
  } catch (error) {
    console.error('Bed update API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bed availability' },
      { status: 500 }
    );
  }
}