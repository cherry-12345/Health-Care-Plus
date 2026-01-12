"use client";
import { useState, useEffect } from "react";

interface EmergencyData {
  patientCondition: 'critical' | 'severe' | 'moderate';
  requiredBedType: 'icu' | 'ventilator' | 'oxygen' | 'general';
  bloodType?: string;
  urgencyLevel: 1 | 2 | 3 | 4 | 5;
}

interface IntelligentRecommendation {
  name: string;
  distance: number;
  intelligenceScore: number;
  estimatedResponseTime: number;
  beds: any;
  recommendation: string;
}

export default function IntelligentEmergencyDashboard() {
  const [emergencyData, setEmergencyData] = useState<EmergencyData>({
    patientCondition: 'critical',
    requiredBedType: 'icu',
    urgencyLevel: 5
  });
  
  const [recommendations, setRecommendations] = useState<IntelligentRecommendation[]>([]);
  const [predictions, setPredictions] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleEmergencyRequest = async () => {
    setLoading(true);
    try {
      // Simulate user location (Mumbai coordinates)
      const response = await fetch("/api/emergency/intelligent-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...emergencyData,
          latitude: 19.0760,
          longitude: 72.8777
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setRecommendations(result.intelligentRecommendations);
      }
    } catch (error) {
      console.error("Emergency request failed:", error);
    }
    setLoading(false);
  };

  const loadPredictions = async () => {
    try {
      const response = await fetch("/api/intelligent/predict-demand");
      const result = await response.json();
      if (result.success) {
        setPredictions(result);
      }
    } catch (error) {
      console.error("Failed to load predictions:", error);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-red-800 mb-4">
          🚨 Intelligent Emergency Response System
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Patient Condition</label>
            <select
              value={emergencyData.patientCondition}
              onChange={(e) => setEmergencyData({...emergencyData, patientCondition: e.target.value as any})}
              className="w-full p-2 border rounded"
            >
              <option value="critical">Critical</option>
              <option value="severe">Severe</option>
              <option value="moderate">Moderate</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Required Bed Type</label>
            <select
              value={emergencyData.requiredBedType}
              onChange={(e) => setEmergencyData({...emergencyData, requiredBedType: e.target.value as any})}
              className="w-full p-2 border rounded"
            >
              <option value="icu">ICU</option>
              <option value="ventilator">Ventilator</option>
              <option value="oxygen">Oxygen</option>
              <option value="general">General</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Urgency Level</label>
            <select
              value={emergencyData.urgencyLevel}
              onChange={(e) => setEmergencyData({...emergencyData, urgencyLevel: parseInt(e.target.value) as any})}
              className="w-full p-2 border rounded"
            >
              <option value={5}>5 - Life Threatening</option>
              <option value={4}>4 - Urgent</option>
              <option value={3}>3 - Serious</option>
              <option value={2}>2 - Moderate</option>
              <option value={1}>1 - Minor</option>
            </select>
          </div>
        </div>
        
        <button
          onClick={handleEmergencyRequest}
          disabled={loading}
          className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "🔄 Finding Best Hospitals..." : "🚨 Find Emergency Care"}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">🧠 AI-Powered Hospital Recommendations</h2>
          <div className="space-y-4">
            {recommendations.map((hospital, index) => (
              <div key={index} className={`p-4 rounded border-l-4 ${
                hospital.recommendation === "Highly Recommended" ? "border-green-500 bg-green-50" :
                hospital.recommendation === "Recommended" ? "border-blue-500 bg-blue-50" :
                "border-yellow-500 bg-yellow-50"
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold">{hospital.name}</h3>
                    <p className="text-sm text-gray-600">
                      Distance: {(hospital.distance / 1000).toFixed(1)} km | 
                      ETA: {hospital.estimatedResponseTime?.toFixed(0)} min
                    </p>
                    <p className="text-sm">
                      Available {emergencyData.requiredBedType}: {hospital.beds?.[emergencyData.requiredBedType]?.available || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      Score: {hospital.intelligenceScore?.toFixed(0)}
                    </div>
                    <div className={`text-sm font-medium ${
                      hospital.recommendation === "Highly Recommended" ? "text-green-600" :
                      hospital.recommendation === "Recommended" ? "text-blue-600" :
                      "text-yellow-600"
                    }`}>
                      {hospital.recommendation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {predictions && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">📊 Intelligent Resource Predictions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-red-50 p-4 rounded border border-red-200">
              <h3 className="font-bold text-red-800">Critical Alerts</h3>
              <div className="text-2xl font-bold text-red-600">
                {predictions.summary?.criticalAlerts || 0}
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
              <h3 className="font-bold text-yellow-800">High Risk Hospitals</h3>
              <div className="text-2xl font-bold text-yellow-600">
                {predictions.summary?.highRisk || 0}
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded border border-blue-200">
              <h3 className="font-bold text-blue-800">Total Monitored</h3>
              <div className="text-2xl font-bold text-blue-600">
                {predictions.summary?.totalHospitals || 0}
              </div>
            </div>
          </div>

          {predictions.intelligentAlerts?.length > 0 && (
            <div>
              <h3 className="font-bold mb-2">🚨 Active Alerts</h3>
              <div className="space-y-2">
                {predictions.intelligentAlerts.slice(0, 5).map((alert: any, index: number) => (
                  <div key={index} className={`p-3 rounded border-l-4 ${
                    alert.priority === "CRITICAL" ? "border-red-500 bg-red-50" :
                    "border-yellow-500 bg-yellow-50"
                  }`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{alert.hospital}</span>
                      <span className={`text-sm font-bold ${
                        alert.priority === "CRITICAL" ? "text-red-600" : "text-yellow-600"
                      }`}>
                        {alert.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}