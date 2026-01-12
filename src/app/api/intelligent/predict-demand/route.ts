import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();

    const predictions = await Hospital.aggregate([
      {
        $project: {
          name: 1,
          beds: 1,
          bloodBank: 1,
          // Intelligent bed utilization prediction
          bedUtilization: {
            general: {
              $divide: ["$beds.general.occupied", "$beds.general.total"]
            },
            icu: {
              $divide: ["$beds.icu.occupied", "$beds.icu.total"]
            },
            oxygen: {
              $divide: ["$beds.oxygen.occupied", "$beds.oxygen.total"]
            },
            ventilator: {
              $divide: ["$beds.ventilator.occupied", "$beds.ventilator.total"]
            }
          },
          // Risk assessment
          riskLevel: {
            $switch: {
              branches: [
                {
                  case: {
                    $or: [
                      { $lt: ["$beds.icu.available", 3] },
                      { $lt: ["$beds.ventilator.available", 2] }
                    ]
                  },
                  then: "HIGH"
                },
                {
                  case: {
                    $or: [
                      { $lt: ["$beds.icu.available", 8] },
                      { $lt: ["$beds.oxygen.available", 10] }
                    ]
                  },
                  then: "MEDIUM"
                }
              ],
              default: "LOW"
            }
          },
          // Blood shortage prediction
          bloodShortageRisk: {
            $map: {
              input: "$bloodBank",
              as: "blood",
              in: {
                bloodGroup: "$$blood.bloodGroup",
                units: "$$blood.units",
                riskLevel: {
                  $switch: {
                    branches: [
                      { case: { $lt: ["$$blood.units", 5] }, then: "CRITICAL" },
                      { case: { $lt: ["$$blood.units", 15] }, then: "LOW" }
                    ],
                    default: "SAFE"
                  }
                },
                predictedDemand: {
                  $multiply: ["$$blood.units", 0.3] // 30% daily consumption rate
                },
                daysRemaining: {
                  $divide: ["$$blood.units", 3] // Assuming 3 units/day consumption
                }
              }
            }
          }
        }
      }
    ]);

    // Generate intelligent alerts
    const alerts = [];
    for (const hospital of predictions) {
      if (hospital.riskLevel === "HIGH") {
        alerts.push({
          type: "BED_SHORTAGE",
          hospital: hospital.name,
          message: "Critical bed shortage detected",
          priority: "HIGH"
        });
      }
      
      for (const blood of hospital.bloodShortageRisk) {
        if (blood.riskLevel === "CRITICAL") {
          alerts.push({
            type: "BLOOD_SHORTAGE",
            hospital: hospital.name,
            bloodGroup: blood.bloodGroup,
            message: `Critical shortage of ${blood.bloodGroup}`,
            priority: "CRITICAL"
          });
        }
      }
    }

    // Emit real-time predictions
    if ((globalThis as any).sendRealtimeUpdate) {
      (globalThis as any).sendRealtimeUpdate({
        type: "INTELLIGENT_PREDICTION",
        alerts: alerts.length,
        highRiskHospitals: predictions.filter(p => p.riskLevel === "HIGH").length,
        timestamp: new Date()
      });
    }

    return NextResponse.json({
      success: true,
      predictions,
      intelligentAlerts: alerts,
      summary: {
        totalHospitals: predictions.length,
        highRisk: predictions.filter(p => p.riskLevel === "HIGH").length,
        mediumRisk: predictions.filter(p => p.riskLevel === "MEDIUM").length,
        criticalAlerts: alerts.filter(a => a.priority === "CRITICAL").length
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}