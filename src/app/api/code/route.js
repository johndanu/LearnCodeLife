import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../../lib/mongodb";
import Analysis from "../../../models/Analysis";

export async function GET() {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch from database - get all analyses for this user, sorted by newest first
        const userId = session.user.id || session.user.email;
        const analyses = await Analysis.find({ userId })
            .sort({ createdAt: -1 }) // Newest first
            .select('_id title language framework createdAt')
            .lean(); // Use lean() for better performance

        return NextResponse.json({
            analyses: analyses.map(analysis => ({
                _id: analysis._id.toString(),
                title: analysis.title,
                language: analysis.language,
                framework: analysis.framework,
                createdAt: analysis.createdAt
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
