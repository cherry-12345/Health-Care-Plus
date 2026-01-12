import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { successResponse, errorResponse } from '@/lib/middleware';

// GET /api/hospitals/emergency - Emergency quick search
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const latitude = searchParams.get('latitude');
    const longitude = searchParams.get('longitude');
    const bedType = searchParams.get('bedType') || 'icu'; // Default to ICU beds
    const minBeds = parseInt(searchParams.get('minBeds') || '1');

    if (!latitude || !longitude) {
      return errorResponse('Location coordinates are required for emergency search', 400);
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return errorResponse('Invalid coordinates', 400);
    }

    // Emergency search: Find nearest hospitals with available beds
    const radiusInMeters = 25000; // 25km radius for emergency

    const emergencyHospitals = await Hospital.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          distanceField: 'distance',
          maxDistance: radiusInMeters,
          spherical: true,
          query: {
            isApproved: true,
            isActive: true,
            hasEmergencyServices: true,
            [`beds.${bedType}.available`]: { $gte: minBeds },
          },
        },
      },
      {
        $limit: 10, // Top 10 nearest
      },
      {
        $project: {
          _id: 1,
          name: 1,
          type: 1,
          address: 1,
          contact: 1,
          beds: 1,
          distance: 1,
          isOpen24x7: 1,
          lastBedUpdate: 1,
        },
      },
    ]);

    // Format response for emergency use
    const formattedHospitals = emergencyHospitals.map((h) => {
      const now = new Date();
      const lastUpdate = new Date(h.lastBedUpdate);
      const minutesAgo = Math.round((now.getTime() - lastUpdate.getTime()) / (1000 * 60));

      return {
        id: h._id,
        name: h.name,
        type: h.type,
        distance: `${(h.distance / 1000).toFixed(1)} km`,
        distanceMeters: h.distance,
        address: `${h.address.street}, ${h.address.city}`,
        emergencyPhone: h.contact.emergency,
        phone: h.contact.phone,
        beds: {
          icu: h.beds.icu.available,
          ventilator: h.beds.ventilator.available,
          oxygen: h.beds.oxygen.available,
          general: h.beds.general.available,
        },
        isOpen24x7: h.isOpen24x7,
        lastUpdated: minutesAgo < 60 
          ? `${minutesAgo} mins ago` 
          : `${Math.round(minutesAgo / 60)} hours ago`,
        isDataFresh: minutesAgo < 60, // Data is fresh if updated within 1 hour
      };
    });

    return successResponse({
      emergency: true,
      searchCriteria: {
        bedType,
        minBeds,
        radiusKm: radiusInMeters / 1000,
      },
      hospitals: formattedHospitals,
      totalFound: formattedHospitals.length,
      message: formattedHospitals.length > 0
        ? `Found ${formattedHospitals.length} hospitals with ${bedType} beds available`
        : `No hospitals with ${bedType} beds found within 25km. Try expanding your search.`,
    });
  } catch (error) {
    console.error('Emergency search error:', error);
    return errorResponse('Emergency search failed. Please call local emergency services.', 500);
  }
}
