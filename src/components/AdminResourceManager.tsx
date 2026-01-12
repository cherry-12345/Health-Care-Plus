"use client";
import { useState, useEffect } from "react";

interface Hospital {
  _id: string;
  name: string;
  beds: {
    general: { total: number; occupied: number; available: number };
    icu: { total: number; occupied: number; available: number };
    oxygen: { total: number; occupied: number; available: number };
    ventilator: { total: number; occupied: number; available: number };
  };
  bloodBank: Array<{
    bloodGroup: string;
    units: number;
    lastUpdated: string;
  }>;
}

export default function AdminResourceManager() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [updateResult, setUpdateResult] = useState<string>("");

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const response = await fetch("/api/hospitals");
      const data = await response.json();
      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Failed to fetch hospitals:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateBedCount = async (bedType: string, field: string, value: number) => {
    if (!selectedHospital) return;

    try {
      const response = await fetch("/api/admin/update-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selectedHospital,
          type: "bed",
          bedType,
          field,
          value
        })
      });

      const result = await response.json();
      if (result.success) {
        setUpdateResult(`✅ Updated ${bedType} ${field} to ${value}`);
        fetchHospitals(); // Refresh data
      } else {
        setUpdateResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setUpdateResult("❌ Network error");
    }
  };

  const updateBloodUnits = async (bloodGroup: string, units: number) => {
    if (!selectedHospital) return;

    try {
      const response = await fetch("/api/admin/update-resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selectedHospital,
          type: "blood",
          bloodGroup,
          units
        })
      });

      const result = await response.json();
      if (result.success) {
        setUpdateResult(`✅ Updated ${bloodGroup} blood to ${units} units`);
        fetchHospitals(); // Refresh data
      } else {
        setUpdateResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setUpdateResult("❌ Network error");
    }
  };

  const selectedHospitalData = hospitals.find(h => h._id === selectedHospital);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          🏥 Admin Resource Management
        </h2>

        {/* Hospital Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Hospital
          </label>
          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Choose a hospital...</option>
            {hospitals.map((hospital) => (
              <option key={hospital._id} value={hospital._id}>
                {hospital.name}
              </option>
            ))}
          </select>
        </div>

        {/* Update Result */}
        {updateResult && (
          <div className="mb-4 p-3 bg-gray-50 border rounded-lg">
            <p className="text-sm">{updateResult}</p>
          </div>
        )}

        {selectedHospitalData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bed Management */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-800 mb-4">🛏️ Bed Management</h3>
              
              {Object.entries(selectedHospitalData.beds).map(([bedType, bedData]) => (
                <div key={bedType} className="mb-4 p-3 bg-white rounded border">
                  <h4 className="font-semibold capitalize mb-2">{bedType} Beds</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <label className="block text-gray-600">Total</label>
                      <input
                        type="number"
                        defaultValue={bedData.total}
                        className="w-full p-1 border rounded"
                        onBlur={(e) => updateBedCount(bedType, "total", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">Occupied</label>
                      <input
                        type="number"
                        defaultValue={bedData.occupied}
                        className="w-full p-1 border rounded"
                        onBlur={(e) => updateBedCount(bedType, "occupied", parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-600">Available</label>
                      <div className="p-1 bg-gray-100 rounded text-center">
                        {bedData.available}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Blood Bank Management */}
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-red-800 mb-4">🩸 Blood Bank Management</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {selectedHospitalData.bloodBank.map((blood) => (
                  <div key={blood.bloodGroup} className="p-3 bg-white rounded border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{blood.bloodGroup}</span>
                      <span className="text-sm text-gray-500">
                        {blood.units} units
                      </span>
                    </div>
                    <input
                      type="number"
                      defaultValue={blood.units}
                      className="w-full p-1 border rounded"
                      onBlur={(e) => updateBloodUnits(blood.bloodGroup, parseInt(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}