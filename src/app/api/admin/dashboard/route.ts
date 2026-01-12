import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital, User, Appointment, Review } from '@/models';
import { withAuth, successResponse, errorResponse } from '@/lib/middleware';

// GET /api/admin/dashboard - Get admin dashboard stats
async function getDashboardStats(req: NextRequest) {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get counts
    const [
      totalHospitals,
      pendingApprovals,
      totalUsers,
      totalAppointments,
      todayAppointments,
      totalBeds,
    ] = await Promise.all([
      Hospital.countDocuments({ isActive: true }),
      Hospital.countDocuments({ isApproved: false, isActive: true }),
      User.countDocuments({ isActive: true }),
      Appointment.countDocuments(),
      Appointment.countDocuments({
        appointmentDate: { $gte: today },
        status: { $nin: ['cancelled'] },
      }),
      Hospital.aggregate([
        { $match: { isActive: true, isApproved: true } },
        {
          $group: {
            _id: null,
            totalGeneral: { $sum: '$beds.general.available' },
            totalICU: { $sum: '$beds.icu.available' },
            totalOxygen: { $sum: '$beds.oxygen.available' },
            totalVentilator: { $sum: '$beds.ventilator.available' },
          },
        },
      ]),
    ]);

    // Get hospitals with stale data (>12 hours)
    const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
    const staleDataHospitals = await Hospital.countDocuments({
      isActive: true,
      isApproved: true,
      lastBedUpdate: { $lt: twelveHoursAgo },
    });

    // Get blood group distribution
    const bloodStats = await Hospital.aggregate([
      { $match: { isActive: true, isApproved: true } },
      { $unwind: '$bloodBank' },
      {
        $group: {
          _id: '$bloodBank.bloodGroup',
          totalUnits: { $sum: '$bloodBank.units' },
          hospitalCount: { $sum: 1 },
        },
      },
      { $sort: { totalUnits: -1 } },
    ]);

    // Get top cities by hospitals
    const topCities = await Hospital.aggregate([
      { $match: { isActive: true, isApproved: true } },
      {
        $group: {
          _id: '$address.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get recent activity
    const recentAppointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('hospitalId', 'name')
      .select('bookingId status createdAt');

    return successResponse({
      overview: {
        totalHospitals,
        pendingApprovals,
        totalUsers,
        totalAppointments,
        todayAppointments,
        staleDataHospitals,
      },
      beds: totalBeds[0] || {
        totalGeneral: 0,
        totalICU: 0,
        totalOxygen: 0,
        totalVentilator: 0,
      },
      bloodStats,
      topCities,
      recentAppointments,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return errorResponse('Failed to get dashboard stats', 500);
  }
}

export const GET = withAuth(
  async (req: NextRequest) => {
    await connectDB();
    return getDashboardStats(req);
  },
  ['admin']
);
