import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { hospitalId, bedType, change } = await req.json();

    await connectDB();

    const result = await Hospital.updateOne(
      {
        _id: hospitalId,
        [`beds.${bedType}.available`]: { $gte: Math.abs(change) }
      },
      {
        $inc: { 
          [`beds.${bedType}.available`]: change,
          [`beds.${bedType}.occupied`]: -change
        },
        $set: { lastBedUpdate: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "No beds available" }, { status: 400 });
    }

    // Emit real-time update
    if ((globalThis as any).sendRealtimeUpdate) {
      (globalThis as any).sendRealtimeUpdate({
        type: "BED_UPDATE",
        hospitalId,
        bedType,
        change,
        timestamp: new Date()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}