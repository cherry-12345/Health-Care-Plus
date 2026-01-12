import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { hospitalId, bloodGroup, change } = await req.json();

    await connectDB();

    const result = await Hospital.updateOne(
      {
        _id: hospitalId,
        "bloodBank.bloodGroup": bloodGroup,
        "bloodBank.units": { $gte: Math.abs(change) }
      },
      {
        $inc: { "bloodBank.$.units": change },
        $set: { 
          "bloodBank.$.lastUpdated": new Date(),
          lastBloodUpdate: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        error: "Insufficient blood units or invalid request" 
      }, { status: 400 });
    }

    // Check for critical blood shortage
    const hospital = await Hospital.findById(hospitalId);
    const bloodStock = hospital?.bloodBank.find(b => b.bloodGroup === bloodGroup);
    
    if (hospital && bloodStock && bloodStock.units <= 5) {
      if ((globalThis as any).sendRealtimeUpdate) {
        (globalThis as any).sendRealtimeUpdate({
          type: "BLOOD_SHORTAGE_ALERT",
          hospitalId,
          hospitalName: hospital.name,
          bloodGroup,
          remainingUnits: bloodStock.units,
          severity: bloodStock.units === 0 ? "CRITICAL" : "WARNING",
          timestamp: new Date()
        });
      }
    }

    // Emit real-time blood update
    if ((globalThis as any).sendRealtimeUpdate) {
      (globalThis as any).sendRealtimeUpdate({
        type: "BLOOD_UPDATE",
        hospitalId,
        bloodGroup,
        change,
        newUnits: bloodStock?.units || 0,
        timestamp: new Date()
      });
    }

    return NextResponse.json({ 
      success: true,
      newUnits: bloodStock?.units || 0
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}