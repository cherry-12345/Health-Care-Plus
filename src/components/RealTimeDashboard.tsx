'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BedStats {
  totalHospitals?: number;
  totalGeneralBeds?: number;
  availableGeneralBeds?: number;
  totalICUBeds?: number;
  availableICUBeds?: number;
  totalOxygenBeds?: number;
  availableOxygenBeds?: number;
  totalVentilatorBeds?: number;
  availableVentilatorBeds?: number;
}

interface BloodStat {
  _id: string;
  totalUnits: number;
  hospitalCount: number;
}

interface StatusCount {
  _id: string;
  count: number;
}

interface DashboardData {
  hospitals: {
    bedStats: BedStats;
    bloodStats: BloodStat[];
    lastUpdated: string | Date;
  };
  appointments: {
    byStatus: StatusCount[];
    todayCount: number;
  };
  users: StatusCount[];
  timestamp: string | Date;
}

export default function RealTimeDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/realtime/dashboard');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading real-time data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Failed to load dashboard data'}</p>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const bedStats = data.hospitals?.bedStats || {
    totalHospitals: 0,
    totalGeneralBeds: 0,
    availableGeneralBeds: 0,
    totalICUBeds: 0,
    availableICUBeds: 0,
    totalOxygenBeds: 0,
    availableOxygenBeds: 0,
    totalVentilatorBeds: 0,
    availableVentilatorBeds: 0,
  };
  const bloodStats = data.hospitals?.bloodStats || [];
  const appointmentsByStatus = data.appointments?.byStatus || [];
  const todayCount = data.appointments?.todayCount || 0;
  const users = data.users || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Real-Time Health Dashboard</h1>
        <div className="text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live • Last updated: {lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Bed Availability Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">General Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bedStats.availableGeneralBeds || 0}
            </div>
            <p className="text-xs text-gray-500">
              of {bedStats.totalGeneralBeds || 0} available
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${((bedStats.availableGeneralBeds || 0) / (bedStats.totalGeneralBeds || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">ICU Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {bedStats.availableICUBeds || 0}
            </div>
            <p className="text-xs text-gray-500">
              of {bedStats.totalICUBeds || 0} available
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-red-600 h-2 rounded-full" 
                style={{ 
                  width: `${((bedStats.availableICUBeds || 0) / (bedStats.totalICUBeds || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Oxygen Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {bedStats.availableOxygenBeds || 0}
            </div>
            <p className="text-xs text-gray-500">
              of {bedStats.totalOxygenBeds || 0} available
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-600 h-2 rounded-full" 
                style={{ 
                  width: `${((bedStats.availableOxygenBeds || 0) / (bedStats.totalOxygenBeds || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Ventilator Beds</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {bedStats.availableVentilatorBeds || 0}
            </div>
            <p className="text-xs text-gray-500">
              of {bedStats.totalVentilatorBeds || 0} available
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ 
                  width: `${((bedStats.availableVentilatorBeds || 0) / (bedStats.totalVentilatorBeds || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blood Bank Status */}
      <Card>
        <CardHeader>
          <CardTitle>Blood Bank Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {bloodStats.length > 0 ? bloodStats.map((blood) => (
              <div key={blood._id} className="text-center">
                <div className="text-lg font-bold text-red-600">{blood.totalUnits}</div>
                <div className="text-sm text-gray-600">{blood._id}</div>
                <div className="text-xs text-gray-500">{blood.hospitalCount} hospitals</div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500">No blood bank data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Appointments Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Today&apos;s Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {todayCount}
            </div>
            <p className="text-sm text-gray-500">appointments scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {appointmentsByStatus.length > 0 ? appointmentsByStatus.map((status) => (
                <div key={status._id} className="flex justify-between items-center">
                  <span className="capitalize text-sm text-gray-600">{status._id}</span>
                  <span className="font-semibold">{status.count}</span>
                </div>
              )) : (
                <div className="text-center text-gray-500">No appointment data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {users.length > 0 ? users.map((user) => (
              <div key={user._id} className="text-center">
                <div className="text-2xl font-bold text-blue-600">{user.count}</div>
                <div className="text-sm text-gray-600 capitalize">{user._id}s</div>
              </div>
            )) : (
              <div className="col-span-full text-center text-gray-500">No user data available</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Auto-refresh indicator */}
      <div className="text-center text-xs text-gray-400">
        Dashboard auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
