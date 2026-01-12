'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { appointmentApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { format, parseISO, isPast } from 'date-fns';
import { useEffect } from 'react';

const statusColors: Record<string, { bg: string; text: string; icon: any }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: CheckCircle },
  'no-show': { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertCircle },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['user-appointments'],
    queryFn: async () => {
      const response = await appointmentApi.getUserAppointments();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const appointments = data?.appointments || [];
  const upcomingAppointments = appointments.filter(
    (apt: any) => !isPast(parseISO(apt.date)) && apt.status !== 'cancelled'
  );
  const pastAppointments = appointments.filter(
    (apt: any) => isPast(parseISO(apt.date)) || apt.status === 'cancelled'
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
          </div>
          <Link href="/hospitals">
            <Button className="mt-4 md:mt-0">
              <Calendar className="h-4 w-4 mr-2" />
              Book New Appointment
            </Button>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900">{appointments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {appointments.filter((a: any) => a.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming appointments</h3>
              <p className="text-gray-600 mb-4">
                Book an appointment with a hospital near you.
              </p>
              <Link href="/hospitals">
                <Button>Find Hospitals</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment: any) => {
                const status = statusColors[appointment.status] || statusColors.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={appointment._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {appointment.hospital?.name || 'Hospital'}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <User className="h-4 w-4" />
                              Dr. {appointment.doctor?.name || 'Doctor'}
                            </p>
                          </div>
                          <span
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}
                          >
                            <StatusIcon className="h-4 w-4" />
                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {format(parseISO(appointment.date), 'EEEE, MMM d, yyyy')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {appointment.timeSlot?.start} - {appointment.timeSlot?.end}
                          </span>
                          {appointment.hospital?.address && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {appointment.hospital.address.city}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link href={`/hospitals/${appointment.hospital?._id}`}>
                          <Button variant="outline" size="sm">
                            View Hospital
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Past Appointments</h2>
            <div className="space-y-4">
              {pastAppointments.slice(0, 5).map((appointment: any) => {
                const status = statusColors[appointment.status] || statusColors.pending;
                const StatusIcon = status.icon;
                return (
                  <div
                    key={appointment._id}
                    className="border rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {appointment.hospital?.name || 'Hospital'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(appointment.date), 'MMM d, yyyy')} • Dr. {appointment.doctor?.name}
                        </p>
                      </div>
                      <span
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${status.bg} ${status.text}`}
                      >
                        <StatusIcon className="h-4 w-4" />
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </div>
                    {appointment.status === 'completed' && !appointment.hasReviewed && (
                      <Link
                        href={`/hospitals/${appointment.hospital?._id}/review`}
                        className="text-blue-600 text-sm hover:underline mt-2 inline-block"
                      >
                        Write a review
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
