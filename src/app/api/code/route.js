import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../../lib/mongodb";
import Analysis from "../../../models/Analysis";

export async function GET(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const label = searchParams.get('label');

        // Connect to database
        await connectDB();

        // Fetch from database - get all analyses for this user, sorted by newest first
        // Use database user ID from session (set by NextAuth callback)
        const userId = session.user?.id;
        const userEmail = session.user?.email;

        if (!userId) {
            return NextResponse.json(
                { error: "User identification failed" },
                { status: 401 }
            );
        }

        // Build base query: primarily use database user ID, but also check for old records saved with email
        const baseQuery = userEmail
            ? { $or: [{ userId: userId }, { userId: userEmail }] }
            : { userId: userId };

        // Combine with filters
        const query = { ...baseQuery };

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        if (label) {
            query.labels = label;
        }

        const analyses = await Analysis.find(query)
            .sort({ createdAt: -1 }) // Newest first
            .select('_id title language framework createdAt labels')
            .lean(); // Use lean() for better performance

        return NextResponse.json({
            analyses: analyses.map(analysis => ({
                _id: analysis._id.toString(),
                title: analysis.title,
                language: analysis.language,
                framework: analysis.framework,
                createdAt: analysis.createdAt,
                labels: analysis.labels || []
            }))
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
