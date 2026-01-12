"use client";
import { useState, useEffect } from "react";
import LiveUpdates from "./LiveUpdates";

interface SystemMetrics {
  totalHospitals: number;
  totalBeds: number;
  availableBeds: number;
  criticalAlerts: number;
  bloodShortages: number;
  emergencyRequests: number;
}

interface HospitalStatus {
  _id: string;
  name: string;
  beds: any;
  bloodBank: any[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  lastUpdate: string;
}

export default function SystemMonitoringDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [hospitals, setHospitals] = useState<HospitalStatus[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSystemMetrics = async () => {
    try {
      const [metricsRes, hospitalsRes, alertsRes] = await Promise.all([
        fetch("/api/realtime/dashboard"),
        fetch("/api/intelligent/predict-demand"),
        fetch("/api/emergency/alerts")
      ]);

      const metricsData = await metricsRes.json();
      const hospitalsData = await hospitalsRes.json();
      const alertsData = await alertsRes.json();

      if (metricsData.success) {
        setMetrics({
          totalHospitals: metricsData.data?.hospitals?.bedStats?.totalHospitals || 0,
          totalBeds: (metricsData.data?.hospitals?.bedStats?.totalGeneralBeds || 0) +
                    (metricsData.data?.hospitals?.bedStats?.totalICUBeds || 0),
          availableBeds: (metricsData.data?.hospitals?.bedStats?.availableGeneralBeds || 0) +
                        (metricsData.data?.hospitals?.bedStats?.availableICUBeds || 0),
          criticalAlerts: alertsData.totalAlerts || 0,
          bloodShortages: hospitalsData.summary?.criticalAlerts || 0,
          emergencyRequests: 0
        });
      }

      if (hospitalsData.success) {
        setHospitals(hospitalsData.predictions || []);
      }

      if (alertsData.success) {
        setAlerts(alertsData.emergencyAlerts || []);
      }

    } catch (error) {
      console.error("Failed to fetch system metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemMetrics();
    const interval = setInterval(fetchSystemMetrics, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system monitoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🏥 System Monitoring Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time monitoring of hospital resources and emergency response
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Monitoring Active</span>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800">Total Hospitals</h3>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalHospitals}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-sm font-medium text-green-800">Available Beds</h3>
            <div className="text-2xl font-bold text-green-600">{metrics.availableBeds}</div>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800">Total Capacity</h3>
            <div className="text-2xl font-bold text-yellow-600">{metrics.totalBeds}</div>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="text-sm font-medium text-red-800">Critical Alerts</h3>
            <div className="text-2xl font-bold text-red-600">{metrics.criticalAlerts}</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-sm font-medium text-purple-800">Blood Shortages</h3>
            <div className="text-2xl font-bold text-purple-600">{metrics.bloodShortages}</div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-sm font-medium text-orange-800">Utilization</h3>
            <div className="text-2xl font-bold text-orange-600">
              {metrics.totalBeds > 0 ? Math.round(((metrics.totalBeds - metrics.availableBeds) / metrics.totalBeds) * 100) : 0}%
            </div>
          </div>
        </div>
      )}

      {/* Critical Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-red-800 mb-4">🚨 Critical System Alerts</h2>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`p-4 rounded border-l-4 ${
                alert.severity === "EMERGENCY" ? "border-red-500 bg-red-50" : "border-yellow-500 bg-yellow-50"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{alert.name}</h3>
                    <p className="text-sm text-gray-600">{alert.address.city}, {alert.address.state}</p>
                    <p className="text-sm mt-1">
                      ICU: {alert.beds.icu.available} | Ventilator: {alert.beds.ventilator.available}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      alert.severity === "EMERGENCY" ? "bg-red-200 text-red-800" : "bg-yellow-200 text-yellow-800"
                    }`}>
                      {alert.severity}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{alert.alertType}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LiveUpdates />
        
        {/* Hospital Status Overview */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🏥 Hospital Status Overview</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {hospitals.slice(0, 10).map((hospital, index) => (
              <div key={index} className={`p-3 rounded border-l-4 ${
                hospital.riskLevel === "CRITICAL" ? "border-red-500 bg-red-50" :
                hospital.riskLevel === "HIGH" ? "border-orange-500 bg-orange-50" :
                hospital.riskLevel === "MEDIUM" ? "border-yellow-500 bg-yellow-50" :
                "border-green-500 bg-green-50"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{hospital.name}</h3>
                    <p className="text-xs text-gray-600">
                      ICU: {hospital.beds?.icu?.available || 0} | 
                      Ventilator: {hospital.beds?.ventilator?.available || 0}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    hospital.riskLevel === "CRITICAL" ? "bg-red-200 text-red-800" :
                    hospital.riskLevel === "HIGH" ? "bg-orange-200 text-orange-800" :
                    hospital.riskLevel === "MEDIUM" ? "bg-yellow-200 text-yellow-800" :
                    "bg-green-200 text-green-800"
                  }`}>
                    {hospital.riskLevel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}