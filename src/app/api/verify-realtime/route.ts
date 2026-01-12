import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

interface TestResult {
  test: string;
  status: string;
  data: any;
}

export async function GET() {
  try {
    await connectDB();

    const testResults: {
      databaseConnected: boolean;
      timestamp: Date;
      tests: TestResult[];
    } = {
      databaseConnected: true,
      timestamp: new Date(),
      tests: []
    };

    // Test bed data connectivity
    const hospitalWithBeds = await Hospital.findOne({
      "beds.general.total": { $gt: 0 }
    }).select("name beds lastBedUpdate");

    testResults.tests.push({
      test: "Bed Data Connection",
      status: hospitalWithBeds ? "CONNECTED" : "FAILED",
      data: hospitalWithBeds ? {
        hospital: hospitalWithBeds.name,
        beds: hospitalWithBeds.beds,
        lastUpdate: hospitalWithBeds.lastBedUpdate
      } : null
    });

    // Test blood data connectivity
    const hospitalWithBlood = await Hospital.findOne({
      "bloodBank.units": { $gt: 0 }
    }).select("name bloodBank lastBloodUpdate");

    testResults.tests.push({
      test: "Blood Data Connection",
      status: hospitalWithBlood ? "CONNECTED" : "FAILED",
      data: hospitalWithBlood ? {
        hospital: hospitalWithBlood.name,
        bloodBank: hospitalWithBlood.bloodBank,
        lastUpdate: hospitalWithBlood.lastBloodUpdate
      } : null
    });

    // Test real-time aggregation
    const realtimeStats = await Hospital.aggregate([
      {
        $group: {
          _id: null,
          totalHospitals: { $sum: 1 },
          totalGeneralBeds: { $sum: "$beds.general.total" },
          availableGeneralBeds: { $sum: "$beds.general.available" },
          totalICUBeds: { $sum: "$beds.icu.total" },
          availableICUBeds: { $sum: "$beds.icu.available" }
        }
      }
    ]);

    testResults.tests.push({
      test: "Real-time Aggregation",
      status: realtimeStats.length > 0 ? "CONNECTED" : "FAILED",
      data: realtimeStats[0] || null
    });

    const allConnected = testResults.tests.every(test => test.status === "CONNECTED");
    
    return NextResponse.json({
      success: true,
      realTimeConnected: allConnected,
      message: allConnected 
        ? "✅ MongoDB is fully connected for real-time bed and blood data"
        : "⚠️ Some connections have issues",
      ...testResults
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      realTimeConnected: false,
      message: "❌ Database connection failed",
      error: error.message
    }, { status: 500 });
  }
}