import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { hospitalId, type, bedType, field, value, bloodGroup, units } = await req.json();

    await connectDB();

    if (type === "bed") {
      // Update bed information
      const updateField = `beds.${bedType}.${field}`;
      
      const result = await Hospital.updateOne(
        { _id: hospitalId },
        { 
          $set: { 
            [updateField]: value,
            lastBedUpdate: new Date()
          }
        }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Hospital not found or no changes made" }, { status: 400 });
      }

      // Recalculate available beds
      const hospital = await Hospital.findById(hospitalId);
      if (hospital) {
        const bedData = hospital.beds[bedType as keyof typeof hospital.beds];
        const available = Math.max(0, bedData.total - bedData.occupied);
        
        await Hospital.updateOne(
          { _id: hospitalId },
          { $set: { [`beds.${bedType}.available`]: available } }
        );
      }

      // Emit real-time update
      if ((globalThis as any).sendRealtimeUpdate) {
        (globalThis as any).sendRealtimeUpdate({
          type: "ADMIN_BED_UPDATE",
          hospitalId,
          bedType,
          field,
          value,
          timestamp: new Date()
        });
      }

    } else if (type === "blood") {
      // Update blood bank
      const result = await Hospital.updateOne(
        { 
          _id: hospitalId,
          "bloodBank.bloodGroup": bloodGroup
        },
        { 
          $set: { 
            "bloodBank.$.units": units,
            "bloodBank.$.lastUpdated": new Date(),
            lastBloodUpdate: new Date()
          }
        }
      );

      if (result.modifiedCount === 0) {
        return NextResponse.json({ error: "Hospital or blood group not found" }, { status: 400 });
      }

      // Emit real-time update
      if ((globalThis as any).sendRealtimeUpdate) {
        (globalThis as any).sendRealtimeUpdate({
          type: "ADMIN_BLOOD_UPDATE",
          hospitalId,
          bloodGroup,
          units,
          timestamp: new Date()
        });
      }

      // Check for critical shortage
      if (units <= 5) {
        if ((globalThis as any).sendRealtimeUpdate) {
          (globalThis as any).sendRealtimeUpdate({
            type: "BLOOD_SHORTAGE_ALERT",
            hospitalId,
            bloodGroup,
            remainingUnits: units,
            severity: units === 0 ? "CRITICAL" : "WARNING",
            timestamp: new Date()
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}