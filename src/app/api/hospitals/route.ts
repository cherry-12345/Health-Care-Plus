import { NextRequest } from 'next/server';
import connectDB from '@/lib/db';
import { Hospital } from '@/models';
import { successResponse, errorResponse } from '@/lib/middleware';
import { searchSchema } from '@/lib/validations';
import { demoHospitals } from '@/lib/demo-data';

// GET /api/hospitals - Search and list hospitals
export async function GET(req: NextRequest) {
  try {
    let useDemoData = false;
    
    try {
      await connectDB();
    } catch (dbError) {
      console.log('MongoDB unavailable, using demo data');
      useDemoData = true;
    }

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const queryParams = {
      city: searchParams.get('city') || undefined,
      latitude: searchParams.get('latitude') ? parseFloat(searchParams.get('latitude')!) : undefined,
      longitude: searchParams.get('longitude') ? parseFloat(searchParams.get('longitude')!) : undefined,
      radius: searchParams.get('radius') ? parseInt(searchParams.get('radius')!) : 25, // default 25km
      bedType: searchParams.get('bedType') || undefined,
      bloodGroup: searchParams.get('bloodGroup') || undefined,
      minBloodUnits: searchParams.get('minBloodUnits') ? parseInt(searchParams.get('minBloodUnits')!) : undefined,
      hospitalType: searchParams.get('hospitalType') || undefined,
      minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
      isOpen24x7: searchParams.get('isOpen24x7') === 'true' ? true : undefined,
      hasEmergency: searchParams.get('hasEmergency') === 'true' ? true : undefined,
      sortBy: searchParams.get('sortBy') || 'distance',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    };

    // Validate params
    const validationResult = searchSchema.safeParse(queryParams);
    if (!validationResult.success) {
      return errorResponse(validationResult.error.issues[0].message, 400);
    }

    const params = validationResult.data;

    // Build query
    const query: any = {
      isApproved: true,
      isActive: true,
    };

    // City filter
    if (params.city) {
      query['address.city'] = new RegExp(params.city, 'i');
    }

    // Hospital type filter
    if (params.hospitalType) {
      query.type = params.hospitalType;
    }

    // Rating filter
    if (params.minRating) {
      query['rating.overall'] = { $gte: params.minRating };
    }

    // 24x7 filter
    if (params.isOpen24x7) {
      query.isOpen24x7 = true;
    }

    // Emergency services filter
    if (params.hasEmergency) {
      query.hasEmergencyServices = true;
    }

    // Bed availability filter
    if (params.bedType) {
      query[`beds.${params.bedType}.available`] = { $gt: 0 };
    }

    // Blood group filter
    if (params.bloodGroup) {
      query['bloodBank'] = {
        $elemMatch: {
          bloodGroup: params.bloodGroup,
          units: { $gte: params.minBloodUnits || 1 },
        },
      };
    }

    // Pagination
    const skip = ((params.page || 1) - 1) * (params.limit || 20);
    const limit = params.limit || 20;

    let hospitals;
    let total;

    // Use demo data if MongoDB is unavailable
    if (useDemoData) {
      let filteredHospitals = [...demoHospitals];

      // Apply filters
      if (params.city) {
        filteredHospitals = filteredHospitals.filter((h) =>
          h.address.city.toLowerCase().includes(params.city!.toLowerCase())
        );
      }
      if (params.hospitalType) {
        filteredHospitals = filteredHospitals.filter((h) => h.type === params.hospitalType);
      }
      if (params.minRating) {
        filteredHospitals = filteredHospitals.filter((h) => h.rating.overall >= params.minRating!);
      }
      if (params.bedType) {
        const bedType = params.bedType as keyof typeof demoHospitals[0]['beds'];
        filteredHospitals = filteredHospitals.filter((h) => h.beds[bedType].available > 0);
      }
      if (params.bloodGroup) {
        filteredHospitals = filteredHospitals.filter((h) =>
          h.bloodBank.some((b) => b.bloodGroup === params.bloodGroup && b.units >= (params.minBloodUnits || 1))
        );
      }

      total = filteredHospitals.length;
      hospitals = filteredHospitals.slice(skip, skip + limit);

      return successResponse({
        hospitals,
        pagination: {
          page: params.page || 1,
          limit: params.limit || 20,
          total,
          totalPages: Math.ceil(total / (params.limit || 20)),
        },
        demo: true,
      });
    }

    // Geospatial query if coordinates provided
    if (params.latitude && params.longitude) {
      const radiusInMeters = (params.radius || 25) * 1000;

      hospitals = await Hospital.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [params.longitude, params.latitude],
            },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query: query,
          },
        },
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            userId: 0,
            __v: 0,
          },
        },
      ]);

      // Get total count for pagination
      const countResult = await Hospital.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [params.longitude, params.latitude],
            },
            distanceField: 'distance',
            maxDistance: radiusInMeters,
            spherical: true,
            query: query,
          },
        },
        { $count: 'total' },
      ]);

      total = countResult[0]?.total || 0;

      // Convert distance to km
      hospitals = hospitals.map((h) => ({
        ...h,
        distance: Math.round((h.distance / 1000) * 10) / 10, // Convert to km with 1 decimal
      }));
    } else {
      // Regular query without geospatial
      let sortOptions: any = {};
      switch (params.sortBy) {
        case 'rating':
          sortOptions = { 'rating.overall': -1 };
          break;
        case 'beds':
          sortOptions = { 'beds.general.available': -1 };
          break;
        case 'updated':
          sortOptions = { lastBedUpdate: -1 };
          break;
        default:
          sortOptions = { createdAt: -1 };
      }

      hospitals = await Hospital.find(query)
        .select('-userId -__v')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      total = await Hospital.countDocuments(query);
    }

    return successResponse({
      hospitals,
      pagination: {
        page: params.page || 1,
        limit: params.limit || 20,
        total,
        totalPages: Math.ceil(total / (params.limit || 20)),
      },
    });
  } catch (error) {
    console.error('Hospital search error:', error);
    return errorResponse('Failed to search hospitals', 500);
  }
}
