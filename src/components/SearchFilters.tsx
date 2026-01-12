'use client';

import { useState } from 'react';
import { Search, MapPin, Filter, X } from 'lucide-react';
import { BloodGroup, SearchParams } from '@/types';

interface SearchFiltersProps {
  onSearch: (params: SearchParams) => void;
  isLoading?: boolean;
}

const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const hospitalTypes = ['government', 'private', 'multispecialty', 'trauma', 'maternity'];
const bedTypes = ['general', 'icu', 'oxygen', 'ventilator'];

export default function SearchFilters({ onSearch, isLoading }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [city, setCity] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(25);
  const [bedType, setBedType] = useState<string>('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [hospitalType, setHospitalType] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [isOpen24x7, setIsOpen24x7] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);

  const handleLocationClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setUseLocation(true);
          setCity('');
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please enter a city name.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSearch = () => {
    const params: SearchParams = {};

    if (useLocation && coordinates) {
      params.latitude = coordinates.lat;
      params.longitude = coordinates.lng;
      params.radius = radius;
    } else if (city) {
      params.city = city;
    }

    if (bedType) params.bedType = bedType as SearchParams['bedType'];
    if (bloodGroup) params.bloodGroup = bloodGroup as SearchParams['bloodGroup'];
    if (hospitalType) params.hospitalType = hospitalType;
    if (minRating > 0) params.minRating = minRating;
    if (isOpen24x7) params.isOpen24x7 = true;
    if (hasEmergency) params.hasEmergency = true;

    onSearch(params);
  };

  const clearFilters = () => {
    setCity('');
    setUseLocation(false);
    setCoordinates(null);
    setRadius(25);
    setBedType('');
    setBloodGroup('');
    setHospitalType('');
    setMinRating(0);
    setIsOpen24x7(false);
    setHasEmergency(false);
    onSearch({});
  };

  const hasActiveFilters = bedType || bloodGroup || hospitalType || minRating > 0 || isOpen24x7 || hasEmergency;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      {/* Main Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setUseLocation(false);
            }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={useLocation}
          />
        </div>

        <button
          onClick={handleLocationClick}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            useLocation
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <MapPin className="h-5 w-5" />
          {useLocation ? 'Using Location' : 'Use My Location'}
        </button>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            showFilters || hasActiveFilters
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </button>

        <button
          onClick={handleSearch}
          disabled={isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-700">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Radius (when using location) */}
            {useLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search Radius
                </label>
                <select
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={25}>25 km</option>
                  <option value={50}>50 km</option>
                  <option value={100}>100 km</option>
                </select>
              </div>
            )}

            {/* Bed Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bed Type Needed
              </label>
              <select
                value={bedType}
                onChange={(e) => setBedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                {bedTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group Needed
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                {bloodGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </div>

            {/* Hospital Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hospital Type
              </label>
              <select
                value={hospitalType}
                onChange={(e) => setHospitalType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                {hospitalTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Minimum Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Any Rating</option>
                <option value={4}>4+ Stars</option>
                <option value={3}>3+ Stars</option>
                <option value={2}>2+ Stars</option>
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOpen24x7}
                  onChange={(e) => setIsOpen24x7(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Open 24/7</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasEmergency}
                  onChange={(e) => setHasEmergency(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-gray-700">Emergency Services</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
