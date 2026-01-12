import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

interface EmergencyRequest {
  patientCondition: 'critical' | 'severe' | 'moderate';
  requiredBedType: 'icu' | 'ventilator' | 'oxygen' | 'general';
  bloodType?: string;
  latitude: number;
  longitude: number;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
}

export async function POST(req: Request) {
  try {
    const emergencyData: EmergencyRequest = await req.json();
    
    await connectDB();

    const hospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [emergencyData.longitude, emergencyData.latitude]
          },
          distanceField: "distance",
          maxDistance: 50000,
          spherical: true,
          query: {
            isActive: true,
            hasEmergencyServices: true,
            [`beds.${emergencyData.requiredBedType}.available`]: { $gt: 0 }
          }
        }
      },
      {
        $addFields: {
          intelligenceScore: {
            $add: [
              { $divide: [25000, { $add: ["$distance", 1] }] },
              { $multiply: [`$beds.${emergencyData.requiredBedType}.available`, 10] },
              { $multiply: ["$rating.overall", 20] },
              { $cond: [{ $eq: ["$isOpen24x7", true] }, 50, 0] }
            ]
          },
          estimatedResponseTime: {
            $add: [
              { $divide: ["$distance", 833] },
              5
            ]
          }
        }
      },
      { $sort: { intelligenceScore: -1 } },
      { $limit: 5 }
    ]);

    if ((globalThis as any).sendRealtimeUpdate) {
      (globalThis as any).sendRealtimeUpdate({
        type: "EMERGENCY_REQUEST",
        condition: emergencyData.patientCondition,
        bedType: emergencyData.requiredBedType,
        urgency: emergencyData.urgencyLevel,
        hospitalsFound: hospitals.length,
        timestamp: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      emergency: true,
      intelligentRecommendations: hospitals,
      emergencyProtocol: {
        priority: emergencyData.urgencyLevel,
        estimatedTime: hospitals[0]?.estimatedResponseTime || "Unknown"
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}