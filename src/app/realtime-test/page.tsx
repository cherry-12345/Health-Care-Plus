"use client";
import { useState } from "react";
import LiveUpdates from "@/components/LiveUpdates";
import RealTimeDashboard from '@/components/RealTimeDashboard';

export default function RealtimeTestPage() {
  const [hospitalId, setHospitalId] = useState("");
  const [bedType, setBedType] = useState("icu");
  const [change, setChange] = useState(-1);
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [bloodChange, setBloodChange] = useState(-2);
  const [testResults, setTestResults] = useState<any[]>([]);

  const updateBeds = async () => {
    try {
      const response = await fetch("/api/hospitals/update-beds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId, bedType, change })
      });
      
      const result = await response.json();
      if (result.success) {
        setTestResults(prev => [...prev, {
          type: "BED_UPDATE",
          status: "SUCCESS",
          message: `Updated ${bedType} beds by ${change}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        setTestResults(prev => [...prev, {
          type: "BED_UPDATE",
          status: "ERROR",
          message: result.error,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: "BED_UPDATE",
        status: "ERROR",
        message: "Network error",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const updateBlood = async () => {
    try {
      const response = await fetch("/api/hospitals/update-blood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId, bloodGroup, change: bloodChange })
      });
      
      const result = await response.json();
      if (result.success) {
        setTestResults(prev => [...prev, {
          type: "BLOOD_UPDATE",
          status: "SUCCESS",
          message: `Updated ${bloodGroup} blood by ${bloodChange} units`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } else {
        setTestResults(prev => [...prev, {
          type: "BLOOD_UPDATE",
          status: "ERROR",
          message: result.error,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: "BLOOD_UPDATE",
        status: "ERROR",
        message: "Network error",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const testEmergencyResponse = async () => {
    try {
      const response = await fetch("/api/emergency/intelligent-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientCondition: "critical",
          requiredBedType: "icu",
          urgencyLevel: 5,
          latitude: 19.0760,
          longitude: 72.8777
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setTestResults(prev => [...prev, {
          type: "EMERGENCY_TEST",
          status: "SUCCESS",
          message: `Found ${result.intelligentRecommendations?.length || 0} hospitals`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: "EMERGENCY_TEST",
        status: "ERROR",
        message: "Emergency test failed",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  };

  const runFullSystemTest = async () => {
    setTestResults([]);
    
    // Test sequence
    const tests = [
      { name: "Database Connection", endpoint: "/api/test-connection" },
      { name: "Emergency Alerts", endpoint: "/api/emergency/alerts" },
      { name: "Intelligent Predictions", endpoint: "/api/intelligent/predict-demand" },
      { name: "Real-time Stream", endpoint: "/api/realtime/stream" }
    ];

    for (const test of tests) {
      try {
        const response = await fetch(test.endpoint);
        const result = await response.json();
        
        setTestResults(prev => [...prev, {
          type: "SYSTEM_TEST",
          status: result.success !== false ? "SUCCESS" : "ERROR",
          message: `${test.name}: ${result.success !== false ? "PASSED" : "FAILED"}`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          type: "SYSTEM_TEST",
          status: "ERROR",
          message: `${test.name}: FAILED`,
          timestamp: new Date().toLocaleTimeString()
        }]);
      }
      
      // Wait between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Comprehensive System Testing</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Test Controls */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Manual Tests</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Hospital ID</label>
              <input
                type="text"
                value={hospitalId}
                onChange={(e) => setHospitalId(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter hospital ID"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-2">Bed Type</label>
                <select
                  value={bedType}
                  onChange={(e) => setBedType(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="general">General</option>
                  <option value="icu">ICU</option>
                  <option value="oxygen">Oxygen</option>
                  <option value="ventilator">Ventilator</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Change</label>
                <input
                  type="number"
                  value={change}
                  onChange={(e) => setChange(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-2">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Units</label>
                <input
                  type="number"
                  value={bloodChange}
                  onChange={(e) => setBloodChange(parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={updateBeds}
                className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
              >
                Test Bed Update
              </button>
              
              <button
                onClick={updateBlood}
                className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700"
              >
                Test Blood Update
              </button>
              
              <button
                onClick={testEmergencyResponse}
                className="w-full bg-orange-600 text-white p-2 rounded hover:bg-orange-700"
              >
                Test Emergency Response
              </button>
              
              <button
                onClick={runFullSystemTest}
                className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
              >
                Run Full System Test
              </button>
            </div>
          </div>
        </div>
        
        {/* Test Results */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Test Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tests run yet...</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className={`p-3 rounded border-l-4 ${
                  result.status === "SUCCESS" ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold text-sm">{result.type}</span>
                      <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${
                        result.status === "SUCCESS" ? "text-green-600" : "text-red-600"
                      }`}>
                        {result.status}
                      </span>
                      <p className="text-xs text-gray-500">{result.timestamp}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Live Updates */}
        <LiveUpdates />
      </div>
      
      {/* Real-time Dashboard */}
      <RealTimeDashboard />
    </div>
  );
}