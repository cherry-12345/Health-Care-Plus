import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const CRITICAL_ICU_THRESHOLD = 3;
    const CRITICAL_VENTILATOR_THRESHOLD = 2;
    const CRITICAL_BLOOD_THRESHOLD = 5;

    const emergencyAlerts = await Hospital.aggregate([
      {
        $match: {
          isActive: true,
          isApproved: true,
          $or: [
            { "beds.icu.available": { $lte: CRITICAL_ICU_THRESHOLD } },
            { "beds.ventilator.available": { $lte: CRITICAL_VENTILATOR_THRESHOLD } },
            {
              "bloodBank": {
                $elemMatch: {
                  units: { $lte: CRITICAL_BLOOD_THRESHOLD }
                }
              }
            }
          ]
        }
      },
      {
        $project: {
          name: 1,
          address: 1,
          contact: 1,
          beds: 1,
          bloodBank: 1,
          alertType: {
            $cond: [
              { $lte: ["$beds.icu.available", CRITICAL_ICU_THRESHOLD] },
              "CRITICAL_ICU_SHORTAGE",
              {
                $cond: [
                  { $lte: ["$beds.ventilator.available", CRITICAL_VENTILATOR_THRESHOLD] },
                  "CRITICAL_VENTILATOR_SHORTAGE",
                  "CRITICAL_BLOOD_SHORTAGE"
                ]
              }
            ]
          },
          severity: {
            $cond: [
              {
                $or: [
                  { $eq: ["$beds.icu.available", 0] },
                  { $eq: ["$beds.ventilator.available", 0] }
                ]
              },
              "EMERGENCY",
              "WARNING"
            ]
          },
          timestamp: new Date()
        }
      }
    ]);

    if ((globalThis as any).sendRealtimeUpdate && emergencyAlerts.length > 0) {
      (globalThis as any).sendRealtimeUpdate({
        type: "EMERGENCY_ALERT",
        alertCount: emergencyAlerts.length,
        criticalHospitals: emergencyAlerts.map(h => h.name),
        timestamp: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      emergencyAlerts,
      totalAlerts: emergencyAlerts.length,
      systemStatus: emergencyAlerts.length > 0 ? "EMERGENCY" : "NORMAL"
    });

  } catch (error: any) {
    console.error('Emergency alerts error:', error);
    return NextResponse.json({ 
      success: false,
      error: error.message || 'Failed to fetch emergency alerts',
      emergencyAlerts: [],
      totalAlerts: 0,
      systemStatus: "UNKNOWN"
    }, { status: 500 });
  }
}