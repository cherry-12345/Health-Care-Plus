'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { hospitalApi, appointmentApi, doctorApi } from '@/lib/api';
import { Button, Input } from '@/components/ui';
import {
  Bed,
  Droplets,
  Calendar,
  Users,
  AlertTriangle,
  Save,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';

type TabType = 'beds' | 'blood' | 'appointments' | 'doctors';

export default function HospitalDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('beds');

  // Bed form state
  const [bedForm, setBedForm] = useState({
    general: { available: 0, total: 0 },
    icu: { available: 0, total: 0 },
    oxygen: { available: 0, total: 0 },
    ventilator: { available: 0, total: 0 },
  });

  // Blood form state
  const [bloodForm, setBloodForm] = useState<{ bloodGroup: string; unitsAvailable: number }[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    } else if (!authLoading && user?.role !== 'hospital') {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const { data: hospitalData, isLoading: hospitalLoading } = useQuery({
    queryKey: ['my-hospital'],
    queryFn: async () => {
      const response = await hospitalApi.search({ limit: 1 });
      // For demo, we'll just use the first hospital
      // In production, this would be linked to the logged-in hospital user
      return response.data;
    },
    enabled: isAuthenticated && user?.role === 'hospital',
  });

  const hospital = hospitalData?.hospitals?.[0];

  // Initialize forms when hospital data loads
  useEffect(() => {
    if (hospital) {
      setBedForm({
        general: hospital.beds?.general || { available: 0, total: 0 },
        icu: hospital.beds?.icu || { available: 0, total: 0 },
        oxygen: hospital.beds?.oxygen || { available: 0, total: 0 },
        ventilator: hospital.beds?.ventilator || { available: 0, total: 0 },
      });
      setBloodForm(
        hospital.bloodBank || [
          { bloodGroup: 'A+', unitsAvailable: 0 },
          { bloodGroup: 'A-', unitsAvailable: 0 },
          { bloodGroup: 'B+', unitsAvailable: 0 },
          { bloodGroup: 'B-', unitsAvailable: 0 },
          { bloodGroup: 'AB+', unitsAvailable: 0 },
          { bloodGroup: 'AB-', unitsAvailable: 0 },
          { bloodGroup: 'O+', unitsAvailable: 0 },
          { bloodGroup: 'O-', unitsAvailable: 0 },
        ]
      );
    }
  }, [hospital]);

  const { data: appointmentsData, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['hospital-appointments', hospital?._id],
    queryFn: async () => {
      const response = await appointmentApi.getUserAppointments();
      return response.data;
    },
    enabled: !!hospital?._id,
  });

  const appointments = appointmentsData?.appointments || [];

  // Mutations
  const updateBedsMutation = useMutation({
    mutationFn: (data: {
      general: { available: number; total: number };
      icu: { available: number; total: number };
      oxygen: { available: number; total: number };
      ventilator: { available: number; total: number };
    }) => hospitalApi.updateAllBeds(hospital._id, data),
    onSuccess: () => {
      toast.success('Bed availability updated!');
      queryClient.invalidateQueries({ queryKey: ['my-hospital'] });
    },
    onError: () => toast.error('Failed to update beds'),
  });

  const updateBloodMutation = useMutation({
    mutationFn: (data: { bloodBank: { bloodGroup: string; unitsAvailable: number }[] }) => 
      hospitalApi.updateAllBlood(hospital._id, data.bloodBank),
    onSuccess: () => {
      toast.success('Blood stock updated!');
      queryClient.invalidateQueries({ queryKey: ['my-hospital'] });
    },
    onError: () => toast.error('Failed to update blood stock'),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      appointmentApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('Appointment updated!');
      queryClient.invalidateQueries({ queryKey: ['hospital-appointments'] });
    },
    onError: () => toast.error('Failed to update appointment'),
  });

  if (authLoading || hospitalLoading) {
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
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">No Hospital Linked</h1>
          <p className="text-gray-600 mt-2">Your account is not linked to any hospital yet.</p>
          <p className="text-gray-600">Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'beds' as TabType, label: 'Bed Management', icon: Bed },
    { id: 'blood' as TabType, label: 'Blood Bank', icon: Droplets },
    { id: 'appointments' as TabType, label: 'Appointments', icon: Calendar },
    { id: 'doctors' as TabType, label: 'Doctors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
              <p className="text-gray-600">Hospital Dashboard</p>
            </div>
            {hospital.isVerified ? (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <CheckCircle className="h-4 w-4" />
                Verified
              </span>
            ) : (
              <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                <Clock className="h-4 w-4" />
                Pending Approval
              </span>
            )}
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
        {/* Beds Tab */}
        {activeTab === 'beds' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Update Bed Availability</h2>
              <p className="text-sm text-gray-500">
                Last updated: {hospital.beds?.lastUpdated
                  ? format(new Date(hospital.beds.lastUpdated), 'MMM d, yyyy h:mm a')
                  : 'Never'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              {(['general', 'icu', 'oxygen', 'ventilator'] as const).map((type) => (
                <div key={type} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 capitalize mb-4">{type} Beds</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Available</label>
                      <input
                        type="number"
                        min={0}
                        max={bedForm[type].total}
                        value={bedForm[type].available}
                        onChange={(e) =>
                          setBedForm({
                            ...bedForm,
                            [type]: { ...bedForm[type], available: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Total</label>
                      <input
                        type="number"
                        min={0}
                        value={bedForm[type].total}
                        onChange={(e) =>
                          setBedForm({
                            ...bedForm,
                            [type]: { ...bedForm[type], total: parseInt(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => updateBedsMutation.mutate(bedForm)}
                isLoading={updateBedsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Blood Tab */}
        {activeTab === 'blood' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Update Blood Stock</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {bloodForm.map((blood, index) => (
                <div key={blood.bloodGroup} className="border rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600 mb-2">{blood.bloodGroup}</div>
                  <input
                    type="number"
                    min={0}
                    value={blood.unitsAvailable}
                    onChange={(e) => {
                      const newForm = [...bloodForm];
                      newForm[index].unitsAvailable = parseInt(e.target.value) || 0;
                      setBloodForm(newForm);
                    }}
                    className="w-full px-3 py-2 border rounded-lg text-center"
                  />
                  <p className="text-sm text-gray-500 mt-1">Units</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => updateBloodMutation.mutate({ bloodBank: bloodForm })}
                isLoading={updateBloodMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Manage Appointments</h2>

            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No appointments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt: any) => (
                  <div key={apt._id} className="border rounded-lg p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">{apt.user?.name || 'Patient'}</p>
                        <p className="text-sm text-gray-600">
                          {format(parseISO(apt.date), 'MMM d, yyyy')} • {apt.timeSlot?.start}
                        </p>
                        <p className="text-sm text-gray-600">Dr. {apt.doctor?.name}</p>
                        {apt.symptoms && (
                          <p className="text-sm text-gray-500 mt-1">Symptoms: {apt.symptoms}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() =>
                                updateAppointmentMutation.mutate({
                                  id: apt._id,
                                  status: 'confirmed',
                                })
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateAppointmentMutation.mutate({
                                  id: apt._id,
                                  status: 'cancelled',
                                })
                              }
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <Button
                            size="sm"
                            onClick={() =>
                              updateAppointmentMutation.mutate({
                                id: apt._id,
                                status: 'completed',
                              })
                            }
                          >
                            Mark Complete
                          </Button>
                        )}
                        {['cancelled', 'completed'].includes(apt.status) && (
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${
                              apt.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Doctors</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Doctor
              </Button>
            </div>

            {hospital.doctors?.length > 0 ? (
              <div className="space-y-4">
                {hospital.doctors.map((doctor: any) => (
                  <div key={doctor._id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold">
                          {doctor.name?.charAt(0) || 'D'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        <p className="text-sm text-gray-500">₹{doctor.consultationFee}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No doctors added yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
