'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hospitalApi } from '@/lib/api';
import { AlertCircle, Phone, MapPin, Loader2, Navigation } from 'lucide-react';
import Link from 'next/link';

interface EmergencyHospital {
  id: string;
  name: string;
  type: string;
  distance: string;
  distanceMeters: number;
  address: string;
  emergencyPhone: string;
  phone: string;
  beds: {
    icu: number;
    ventilator: number;
    oxygen: number;
    general: number;
  };
  isOpen24x7: boolean;
  lastUpdated: string;
  isDataFresh: boolean;
}

export default function EmergencyPage() {
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [bedType, setBedType] = useState<string>('icu');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setLocationError('Unable to get your location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser.');
    }
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['emergency', coordinates, bedType],
    queryFn: async () => {
      if (!coordinates) return null;
      const response = await hospitalApi.emergency(coordinates.lat, coordinates.lng, bedType);
      return response.data;
    },
    enabled: !!coordinates,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const hospitals: EmergencyHospital[] = data?.data?.hospitals || [];

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleNavigate = (hospital: EmergencyHospital) => {
    // Open in Google Maps
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-red-50">
      {/* Emergency Header */}
      <div className="bg-red-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <AlertCircle className="h-12 w-12 animate-pulse" />
            <h1 className="text-4xl font-bold">EMERGENCY</h1>
          </div>
          <p className="text-xl text-red-100">
            Finding nearest hospitals with available {bedType.toUpperCase()} beds
          </p>
          <p className="text-sm text-red-200 mt-2">
            Data refreshes every 30 seconds • Last refresh: {new Date().toLocaleTimeString()}
          </p>
        </div>
      </div>

      {/* Bed Type Selection */}
      <div className="bg-white shadow-md py-4">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {['icu', 'ventilator', 'oxygen', 'general'].map((type) => (
              <button
                key={type}
                onClick={() => setBedType(type)}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                  bedType === type
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.toUpperCase()} Beds
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Location Error */}
        {locationError && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <p>{locationError}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-red-600 animate-spin mb-4" />
            <p className="text-gray-700 text-lg">Finding nearest hospitals...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error loading hospitals
            </h3>
            <button
              onClick={() => refetch()}
              className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && coordinates && (
          <>
            {hospitals.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-md">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No hospitals with {bedType.toUpperCase()} beds found within 25km
                </h3>
                <p className="text-gray-600">
                  Try searching for a different bed type or contact emergency services directly.
                </p>
                <a
                  href="tel:102"
                  className="inline-flex items-center gap-2 mt-6 px-8 py-4 bg-red-600 text-white rounded-lg text-xl font-bold"
                >
                  <Phone className="h-6 w-6" />
                  Call 102 (Ambulance)
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-4">
                  Found <span className="font-bold text-red-600">{hospitals.length}</span> hospitals
                  with {bedType.toUpperCase()} beds available
                </p>

                {hospitals.map((hospital, index) => (
                  <div
                    key={hospital.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border-l-4 border-red-600"
                  >
                    <div className="p-4 md:p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="bg-red-600 text-white text-sm font-bold px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">
                              {hospital.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600 mt-1">
                            <MapPin className="h-4 w-4" />
                            <span className="text-sm">{hospital.address}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-red-600">
                            {hospital.distance}
                          </div>
                          <div className="text-xs text-gray-500">
                            {hospital.isDataFresh ? '✅ Fresh data' : '⚠️ May be outdated'}
                          </div>
                        </div>
                      </div>

                      {/* Bed Availability */}
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <div className={`text-center p-2 rounded ${hospital.beds.icu > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          <div className="text-lg font-bold">{hospital.beds.icu}</div>
                          <div className="text-xs">ICU</div>
                        </div>
                        <div className={`text-center p-2 rounded ${hospital.beds.ventilator > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          <div className="text-lg font-bold">{hospital.beds.ventilator}</div>
                          <div className="text-xs">Vent</div>
                        </div>
                        <div className={`text-center p-2 rounded ${hospital.beds.oxygen > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          <div className="text-lg font-bold">{hospital.beds.oxygen}</div>
                          <div className="text-xs">O2</div>
                        </div>
                        <div className={`text-center p-2 rounded ${hospital.beds.general > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
                          <div className="text-lg font-bold">{hospital.beds.general}</div>
                          <div className="text-xs">General</div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCall(hospital.emergencyPhone)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
                        >
                          <Phone className="h-5 w-5" />
                          CALL NOW
                        </button>
                        <button
                          onClick={() => handleNavigate(hospital)}
                          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                        >
                          <Navigation className="h-5 w-5" />
                          Navigate
                        </button>
                      </div>

                      <div className="mt-2 text-xs text-gray-500 text-center">
                        Updated: {hospital.lastUpdated}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Emergency Contacts
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href="tel:102"
                  className="flex items-center gap-3 p-4 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Phone className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="font-bold text-red-600">102</div>
                    <div className="text-sm text-gray-600">Ambulance</div>
                  </div>
                </a>
                <a
                  href="tel:108"
                  className="flex items-center gap-3 p-4 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Phone className="h-8 w-8 text-red-600" />
                  <div>
                    <div className="font-bold text-red-600">108</div>
                    <div className="text-sm text-gray-600">Emergency</div>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
