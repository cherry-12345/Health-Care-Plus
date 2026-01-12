'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { adminApi, hospitalApi } from '@/lib/api';
import { Button } from '@/components/ui';
import AdminResourceManager from '@/components/AdminResourceManager';
import {
  LayoutDashboard,
  Building2,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Search,
  RefreshCw,
  Eye,
  Shield,
  Bed,
  Droplets,
  Settings,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

type TabType = 'overview' | 'hospitals' | 'users' | 'analytics' | 'resources';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [hospitalFilter, setHospitalFilter] = useState<'all' | 'pending' | 'verified'>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const { data: dashboardData, isLoading: dashboardLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await adminApi.getDashboard();
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: hospitalsData, isLoading: hospitalsLoading, refetch: refetchHospitals } = useQuery({
    queryKey: ['admin-hospitals', hospitalFilter],
    queryFn: async () => {
      const response = await adminApi.getHospitals({
        status: hospitalFilter === 'all' ? undefined : hospitalFilter,
      });
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const approveMutation = useMutation({
    mutationFn: (hospitalId: string) => adminApi.approveHospital(hospitalId),
    onSuccess: () => {
      toast.success('Hospital approved!');
      queryClient.invalidateQueries({ queryKey: ['admin-hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
    onError: () => toast.error('Failed to approve hospital'),
  });

  const dashboard = dashboardData?.stats || {
    totalHospitals: 0,
    verifiedHospitals: 0,
    pendingHospitals: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalDoctors: 0,
  };

  const hospitals = hospitalsData?.hospitals || [];

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'hospitals' as TabType, label: 'Hospitals', icon: Building2 },
    { id: 'resources' as TabType, label: 'Resource Manager', icon: Settings },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'analytics' as TabType, label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-blue-200">Manage your healthcare platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 border-b-2 font-medium whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Hospitals</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.totalHospitals}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.verifiedHospitals}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.pendingHospitals}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboard.totalUsers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Appointments Overview</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-10 w-10 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{dashboard.totalAppointments}</p>
                      <p className="text-sm text-gray-600">Total Appointments</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Doctors Registered</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-10 w-10 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">{dashboard.totalDoctors}</p>
                      <p className="text-sm text-gray-600">Active Doctors</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Approvals */}
            {dashboard.pendingHospitals > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">
                    Pending Approvals ({dashboard.pendingHospitals})
                  </h3>
                </div>
                <Button onClick={() => setActiveTab('hospitals')}>
                  Review Pending Hospitals
                </Button>
              </div>
            )}
          </>
        )}

        {/* Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Hospitals</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {(['all', 'pending', 'verified'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setHospitalFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        hospitalFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => refetchHospitals()}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>

            {hospitalsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : hospitals.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hospitals found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {hospitals.map((hospital: any) => (
                  <div
                    key={hospital._id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{hospital.name}</h3>
                          {hospital.isVerified ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs">
                              <Clock className="h-3 w-3" />
                              Pending
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {hospital.address?.city}, {hospital.address?.state}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Bed className="h-4 w-4" />
                            {hospital.beds?.general?.total || 0} beds
                          </span>
                          <span className="flex items-center gap-1">
                            <Droplets className="h-4 w-4" />
                            Blood Bank
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {hospital.doctors?.length || 0} doctors
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!hospital.isVerified && (
                          <Button
                            size="sm"
                            onClick={() => approveMutation.mutate(hospital._id)}
                            isLoading={approveMutation.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/hospitals/${hospital._id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div>
            <AdminResourceManager />
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Users</h2>
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">User management coming soon</p>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analytics & Reports</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Platform Growth</h3>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder</p>
                </div>
              </div>
              <div className="border rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Appointment Trends</h3>
                <div className="h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart placeholder</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
