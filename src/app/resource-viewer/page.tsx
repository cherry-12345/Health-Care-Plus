"use client";
import { useState, useEffect } from "react";

interface Hospital {
  _id: string;
  name: string;
  address: { city: string; state: string };
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
  lastBedUpdate: string;
  lastBloodUpdate: string;
}

export default function ResourceViewerPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "beds" | "blood">("all");
  const [searchTerm, setSearchTerm] = useState("");

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

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBedStatus = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 50) return { color: "text-green-600 bg-green-100", status: "Good" };
    if (percentage > 20) return { color: "text-yellow-600 bg-yellow-100", status: "Low" };
    if (percentage > 0) return { color: "text-orange-600 bg-orange-100", status: "Critical" };
    return { color: "text-red-600 bg-red-100", status: "Full" };
  };

  const getBloodStatus = (units: number) => {
    if (units >= 15) return { color: "text-green-600 bg-green-100", status: "Good" };
    if (units >= 5) return { color: "text-yellow-600 bg-yellow-100", status: "Low" };
    if (units > 0) return { color: "text-orange-600 bg-orange-100", status: "Critical" };
    return { color: "text-red-600 bg-red-100", status: "Empty" };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resource data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Hospital Resource Viewer
          </h1>
          <p className="text-gray-600 mb-4">
            Real-time view of bed availability and blood bank status across all hospitals
          </p>
          
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "all" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                All Resources
              </button>
              <button
                onClick={() => setFilter("beds")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "beds" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                Beds Only
              </button>
              <button
                onClick={() => setFilter("blood")}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === "blood" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                Blood Only
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search hospitals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Hospital Resources */}
        <div className="space-y-6">
          {filteredHospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{hospital.name}</h2>
                  <p className="text-gray-600">{hospital.address.city}, {hospital.address.state}</p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>Beds updated: {new Date(hospital.lastBedUpdate).toLocaleString()}</p>
                  <p>Blood updated: {new Date(hospital.lastBloodUpdate).toLocaleString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bed Availability */}
                {(filter === "all" || filter === "beds") && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">🛏️ Bed Availability</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(hospital.beds).map(([bedType, bedData]) => {
                        const status = getBedStatus(bedData.available, bedData.total);
                        return (
                          <div key={bedType} className="bg-white rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium capitalize">{bedType}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                                {status.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div className="flex justify-between">
                                <span>Available:</span>
                                <span className="font-bold">{bedData.available}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Occupied:</span>
                                <span>{bedData.occupied}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total:</span>
                                <span>{bedData.total}</span>
                              </div>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(bedData.available / bedData.total) * 100}%`
                                }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Blood Bank */}
                {(filter === "all" || filter === "blood") && (
                  <div className="bg-red-50 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-red-800 mb-4">🩸 Blood Bank Status</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {hospital.bloodBank.map((blood) => {
                        const status = getBloodStatus(blood.units);
                        return (
                          <div key={blood.bloodGroup} className="bg-white rounded p-3">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-lg">{blood.bloodGroup}</span>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${status.color}`}>
                                {status.status}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-gray-900">{blood.units}</div>
                              <div className="text-sm text-gray-600">units</div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">
                              Updated: {new Date(blood.lastUpdated).toLocaleDateString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-600">No hospitals found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}