'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { hospitalApi, reviewApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Clock,
  Bed,
  Users,
  Droplets,
  Shield,
  Navigation,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function HospitalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'reviews'>('overview');

  const hospitalId = params.id as string;

  const { data: hospitalData, isLoading } = useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: async () => {
      const response = await hospitalApi.getById(hospitalId);
      return response.data;
    },
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['hospital-reviews', hospitalId],
    queryFn: async () => {
      const response = await reviewApi.getByHospital(hospitalId);
      return response.data;
    },
  });

  const hospital = hospitalData?.hospital;
  const reviews = reviewsData?.reviews || [];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Hospital Not Found</h1>
          <p className="text-gray-600 mt-2">The hospital you&apos;re looking for doesn&apos;t exist.</p>
          <Link href="/hospitals" className="text-blue-600 hover:underline mt-4 inline-block">
            Browse all hospitals
          </Link>
        </div>
      </div>
    );
  }

  const getBedStatusColor = (available: number, total: number) => {
    const ratio = available / total;
    if (ratio > 0.5) return 'text-green-600 bg-green-100';
    if (ratio > 0.2) return 'text-yellow-600 bg-yellow-100';
    if (ratio > 0) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getBloodStatusColor = (units: number) => {
    if (units >= 10) return 'bg-green-500';
    if (units >= 5) return 'bg-yellow-500';
    if (units > 0) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Hospital Image/Logo Placeholder */}
            <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl font-bold text-blue-600">
                {hospital.name.charAt(0)}
              </span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{hospital.name}</h1>
                {hospital.isVerified && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-blue-100 flex items-center gap-2 mb-4">
                <MapPin className="h-4 w-4" />
                {hospital.address?.street}, {hospital.address?.city}, {hospital.address?.state} - {hospital.address?.pincode}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{hospital.averageRating?.toFixed(1) || 'N/A'}</span>
                  <span className="text-blue-200">({hospital.totalReviews || 0} reviews)</span>
                </div>
                {hospital.hasEmergencyServices && (
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                    24/7 Emergency
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => router.push(`/hospitals/${hospitalId}/book`)}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
              <a
                href={`tel:${hospital.contact?.phone}`}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg"
              >
                <Phone className="h-4 w-4" />
                Call Hospital
              </a>
              {hospital.location?.coordinates && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.location.coordinates[1]},${hospital.location.coordinates[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg"
                >
                  <Navigation className="h-4 w-4" />
                  Get Directions
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            {(['overview', 'doctors', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 border-b-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bed Availability */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="h-5 w-5 text-blue-600" />
                  Bed Availability
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'General', key: 'general', icon: Bed },
                    { label: 'ICU', key: 'icu', icon: AlertTriangle },
                    { label: 'Oxygen', key: 'oxygen', icon: Users },
                    { label: 'Ventilator', key: 'ventilator', icon: Shield },
                  ].map(({ label, key, icon: Icon }) => {
                    const available = hospital.beds?.[key]?.available || 0;
                    const total = hospital.beds?.[key]?.total || 0;
                    return (
                      <div
                        key={key}
                        className={`p-4 rounded-xl ${getBedStatusColor(available, total)}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {label} Beds
                          </span>
                          {available > 0 ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <XCircle className="h-5 w-5" />
                          )}
                        </div>
                        <div className="text-2xl font-bold">
                          {available} / {total}
                        </div>
                        <p className="text-sm opacity-75">Available</p>
                      </div>
                    );
                  })}
                </div>
                {hospital.beds?.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last updated {formatDistanceToNow(new Date(hospital.beds.lastUpdated))} ago
                  </p>
                )}
              </div>

              {/* Blood Bank */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-red-600" />
                  Blood Bank
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {hospital.bloodBank?.map((blood: any) => (
                    <div
                      key={blood.bloodGroup}
                      className="text-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold text-sm ${getBloodStatusColor(
                          blood.unitsAvailable
                        )}`}
                      >
                        {blood.unitsAvailable}
                      </div>
                      <p className="text-sm font-medium text-gray-900">{blood.bloodGroup}</p>
                    </div>
                  ))}
                </div>
                {hospital.bloodBank?.[0]?.lastUpdated && (
                  <p className="text-sm text-gray-500 mt-4 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Last updated {formatDistanceToNow(new Date(hospital.bloodBank[0].lastUpdated))} ago
                  </p>
                )}
              </div>

              {/* Departments */}
              {hospital.departments?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Departments</h2>
                  <div className="flex flex-wrap gap-2">
                    {hospital.departments.map((dept: string) => (
                      <span
                        key={dept}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Facilities */}
              {hospital.facilities?.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Facilities</h2>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {hospital.facilities.map((facility: string) => (
                      <div
                        key={facility}
                        className="flex items-center gap-2 text-gray-700"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        {facility}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <a
                    href={`tel:${hospital.contact?.phone}`}
                    className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4" />
                    {hospital.contact?.phone}
                  </a>
                  {hospital.contact?.email && (
                    <a
                      href={`mailto:${hospital.contact.email}`}
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <Mail className="h-4 w-4" />
                      {hospital.contact.email}
                    </a>
                  )}
                  {hospital.contact?.website && (
                    <a
                      href={hospital.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-gray-700 hover:text-blue-600"
                    >
                      <Globe className="h-4 w-4" />
                      Visit Website
                    </a>
                  )}
                </div>
              </div>

              {/* Timings */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">OPD Timings</h3>
                <div className="space-y-2">
                  {hospital.timings?.opd?.map((timing: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{timing.days}</span>
                      <span className="font-medium">
                        {timing.open} - {timing.close}
                      </span>
                    </div>
                  )) || (
                    <p className="text-gray-600">Contact hospital for timings</p>
                  )}
                </div>
                {hospital.hasEmergencyServices && (
                  <div className="mt-4 p-3 bg-red-50 rounded-lg text-center">
                    <p className="text-red-700 font-medium">Emergency: 24/7</p>
                  </div>
                )}
              </div>

              {/* Rating Breakdown */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Ratings</h3>
                {hospital.ratingBreakdown ? (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = hospital.ratingBreakdown[star] || 0;
                      const percentage = hospital.totalReviews
                        ? (count / hospital.totalReviews) * 100
                        : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm w-8">{star}★</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-8">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600">No ratings yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Our Doctors</h2>
            {hospital.doctors?.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospital.doctors.map((doctor: any) => (
                  <div
                    key={doctor._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-bold">
                          {doctor.name?.charAt(0) || 'D'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-blue-600">{doctor.specialization}</p>
                        <p className="text-sm text-gray-600">{doctor.experience} years exp.</p>
                        {doctor.consultationFee && (
                          <p className="text-sm font-medium text-green-600 mt-2">
                            ₹{doctor.consultationFee}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push(`/hospitals/${hospitalId}/book?doctor=${doctor._id}`)}
                    >
                      Book Appointment
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Doctor information not available. Please contact the hospital directly.
              </p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Write Review */}
            {isAuthenticated && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                <Button onClick={() => router.push(`/hospitals/${hospitalId}/review`)}>
                  Share Your Experience
                </Button>
              </div>
            )}

            {/* Reviews List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Patient Reviews ({reviews.length})
              </h2>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review: any) => (
                    <div key={review._id} className="border-b pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{review.user?.name || 'Anonymous'}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(review.createdAt))} ago
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700">{review.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
