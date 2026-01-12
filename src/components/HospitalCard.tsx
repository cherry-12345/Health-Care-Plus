'use client';

import Link from 'next/link';
import { Hospital } from '@/types';
import { MapPin, Phone, Star, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface HospitalCardProps {
  hospital: Hospital;
}

export default function HospitalCard({ hospital }: HospitalCardProps) {
  const getBedStatusColor = (available: number) => {
    if (available >= 10) return 'text-green-600 bg-green-100';
    if (available >= 5) return 'text-yellow-600 bg-yellow-100';
    if (available >= 1) return 'text-red-600 bg-red-100';
    return 'text-gray-500 bg-gray-100';
  };

  const getBedStatusLabel = (available: number) => {
    if (available >= 10) return '🟢';
    if (available >= 5) return '🟡';
    if (available >= 1) return '🔴';
    return '⚫';
  };

  const getBloodStatusColor = (units: number) => {
    if (units >= 10) return 'text-green-600';
    if (units >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const lastUpdated = new Date(hospital.lastBedUpdate);
  const isStale = hospital.isDataStale || false;

  // Get top 4 blood groups with most stock
  const topBloodGroups = [...hospital.bloodBank]
    .sort((a, b) => b.units - a.units)
    .slice(0, 4);

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <Link href={`/hospitals/${hospital._id}`}>
            <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              🏥 {hospital.name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-medium ml-1">
                {hospital.rating.overall.toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({hospital.rating.totalReviews} reviews)
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
            {hospital.type}
          </span>
          {hospital.distance && (
            <span className="text-sm text-gray-600 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {hospital.distance} km
            </span>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          <span>{hospital.address.city}, {hospital.address.state}</span>
        </div>
        <div className="flex items-center gap-1">
          <Phone className="h-4 w-4" />
          <span>{hospital.contact.phone}</span>
        </div>
      </div>

      {/* Bed Availability */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">🛏️ Beds Available</h4>
          {isStale && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Data may be outdated
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <div className={`text-center p-2 rounded-lg ${getBedStatusColor(hospital.beds.general.available)}`}>
            <div className="text-lg font-bold">{hospital.beds.general.available}</div>
            <div className="text-xs">General</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getBedStatusColor(hospital.beds.icu.available)}`}>
            <div className="text-lg font-bold">{hospital.beds.icu.available}</div>
            <div className="text-xs">ICU</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getBedStatusColor(hospital.beds.oxygen.available)}`}>
            <div className="text-lg font-bold">{hospital.beds.oxygen.available}</div>
            <div className="text-xs">Oxygen</div>
          </div>
          <div className={`text-center p-2 rounded-lg ${getBedStatusColor(hospital.beds.ventilator.available)}`}>
            <div className="text-lg font-bold">{hospital.beds.ventilator.available}</div>
            <div className="text-xs">Ventilator</div>
          </div>
        </div>
      </div>

      {/* Blood Stock */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">🩸 Blood Stock</h4>
        <div className="flex flex-wrap gap-2">
          {topBloodGroups.map((blood) => (
            <span
              key={blood.bloodGroup}
              className={`text-sm px-2 py-1 bg-gray-100 rounded ${getBloodStatusColor(blood.units)}`}
            >
              {blood.bloodGroup}: {blood.units}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </div>
        <div className="flex gap-2">
          <Link
            href={`/hospitals/${hospital._id}`}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/hospitals/${hospital._id}/book`}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
}
