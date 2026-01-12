'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { hospitalApi } from '@/lib/api';
import { Button } from '@/components/ui';
import {
  Droplets,
  MapPin,
  Phone,
  Navigation,
  Search,
  AlertCircle,
  RefreshCw,
  Star,
} from 'lucide-react';

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export default function BloodSearchPage() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [searchParams, setSearchParams] = useState<{
    bloodGroup: string;
    lat?: number;
    lng?: number;
    city?: string;
  } | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['blood-search', searchParams],
    queryFn: async () => {
      if (!searchParams?.bloodGroup) return null;
      const response = await hospitalApi.search({
        bloodGroup: searchParams.bloodGroup,
        lat: searchParams.lat,
        lng: searchParams.lng,
        city: searchParams.city,
        limit: 20,
      });
      return response.data;
    },
    enabled: !!searchParams?.bloodGroup,
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error('Location error:', error);
        alert('Unable to get your location');
        setIsLocating(false);
      }
    );
  };

  const handleSearch = () => {
    if (!selectedBloodGroup) {
      alert('Please select a blood group');
      return;
    }

    setSearchParams({
      bloodGroup: selectedBloodGroup,
      lat: coordinates?.lat,
      lng: coordinates?.lng,
      city: searchLocation || undefined,
    });
  };

  const getBloodStock = (hospital: any) => {
    const stock = hospital.bloodBank?.find(
      (b: any) => b.bloodGroup === selectedBloodGroup
    );
    return stock?.unitsAvailable || 0;
  };

  const getStockColor = (units: number) => {
    if (units >= 10) return 'text-green-600 bg-green-100';
    if (units >= 5) return 'text-yellow-600 bg-yellow-100';
    if (units > 0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getStockLabel = (units: number) => {
    if (units >= 10) return 'Available';
    if (units >= 5) return 'Low Stock';
    if (units > 0) return 'Critical';
    return 'Out of Stock';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full mb-4">
            <Droplets className="h-5 w-5" />
            <span className="font-medium">Blood Bank Search</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Find Blood Availability
          </h1>
          <p className="text-gray-600 mt-2">
            Search for blood availability across hospitals in real-time
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Blood Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Blood Group *
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bloodGroups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedBloodGroup(group)}
                    className={`p-3 rounded-lg border-2 font-bold text-sm transition-all ${
                      selectedBloodGroup === group
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 hover:border-red-200 text-gray-700'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Location
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder="Enter city name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>or</span>
                  <button
                    onClick={getLocation}
                    disabled={isLocating}
                    className="flex items-center gap-1 text-red-600 hover:underline"
                  >
                    <MapPin className="h-4 w-4" />
                    {isLocating ? 'Getting location...' : 'Use my location'}
                  </button>
                  {coordinates && (
                    <span className="text-green-600">✓ Location set</span>
                  )}
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button
                onClick={handleSearch}
                disabled={!selectedBloodGroup}
                className="w-full bg-red-600 hover:bg-red-700"
                size="lg"
              >
                <Search className="h-5 w-5 mr-2" />
                Search Blood
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchParams && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedBloodGroup} Blood Availability
              </h2>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
              </div>
            ) : data?.hospitals?.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-600">
                  No hospitals found with {selectedBloodGroup} blood in stock.
                  Try expanding your search area.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {data?.hospitals
                  ?.sort((a: any, b: any) => getBloodStock(b) - getBloodStock(a))
                  .map((hospital: any) => {
                    const stock = getBloodStock(hospital);
                    return (
                      <div
                        key={hospital._id}
                        className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          {/* Hospital Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <Link
                                  href={`/hospitals/${hospital._id}`}
                                  className="text-lg font-semibold text-gray-900 hover:text-red-600"
                                >
                                  {hospital.name}
                                </Link>
                                {hospital.isVerified && (
                                  <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                    Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                                <span>{hospital.averageRating?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </div>
                            <p className="text-gray-600 text-sm mt-1 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {hospital.address?.street}, {hospital.address?.city}
                            </p>
                            {hospital.distance && (
                              <p className="text-sm text-blue-600 mt-1">
                                {hospital.distance.toFixed(1)} km away
                              </p>
                            )}
                          </div>

                          {/* Blood Stock */}
                          <div className="flex items-center gap-4">
                            <div className={`px-6 py-4 rounded-xl text-center ${getStockColor(stock)}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Droplets className="h-6 w-6" />
                                <span className="text-3xl font-bold">{stock}</span>
                              </div>
                              <p className="text-sm font-medium">
                                {getStockLabel(stock)}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <a
                                href={`tel:${hospital.contact?.phone}`}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                              >
                                <Phone className="h-4 w-4" />
                                Call
                              </a>
                              {hospital.location?.coordinates && (
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                  <Navigation className="h-4 w-4" />
                                  Navigate
                                </a>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* All Blood Groups */}
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            All Blood Groups:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {hospital.bloodBank?.map((blood: any) => (
                              <span
                                key={blood.bloodGroup}
                                className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  blood.bloodGroup === selectedBloodGroup
                                    ? 'bg-red-600 text-white'
                                    : blood.unitsAvailable > 0
                                    ? 'bg-gray-100 text-gray-700'
                                    : 'bg-gray-50 text-gray-400'
                                }`}
                              >
                                {blood.bloodGroup}: {blood.unitsAvailable}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Info Section */}
        {!searchParams && (
          <div className="grid md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Search by Blood Group</h3>
              <p className="text-sm text-gray-600">
                Find hospitals with your required blood group in stock
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Location Based</h3>
              <p className="text-sm text-gray-600">
                Find the nearest blood banks using your current location
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Real-time Data</h3>
              <p className="text-sm text-gray-600">
                Blood availability updated in real-time by hospitals
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
