import { connectDB } from "@/lib/db";
import Hospital from "@/models/Hospital";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { bedType, bloodGroup, city, minBeds = 1 } = await req.json();

    await connectDB();

    const query: any = { isActive: true, isApproved: true };

    if (city) {
      query["address.city"] = { $regex: city, $options: "i" };
    }

    if (bedType) {
      query[`beds.${bedType}.available`] = { $gte: minBeds };
    }

    if (bloodGroup) {
      query["bloodBank"] = {
        $elemMatch: {
          bloodGroup: bloodGroup,
          units: { $gt: 0 }
        }
      };
    }

    const hospitals = await Hospital.find(query)
      .select('name type address beds bloodBank contact rating')
      .sort({ 'rating.overall': -1 })
      .limit(20);

    return NextResponse.json({ 
      success: true,
      hospitals,
      count: hospitals.length 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}