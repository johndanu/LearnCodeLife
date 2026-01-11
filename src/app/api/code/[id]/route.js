import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "../../../../lib/mongodb";
import Analysis from "../../../../models/Analysis";

export async function GET(request, { params }) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Handle params - in Next.js 15+, params might be a promise
        const resolvedParams = params instanceof Promise ? await params : params;
        const { id } = resolvedParams;

        if (!id || id === 'undefined' || id === 'null') {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch from database - ensure the analysis belongs to the user
        // Use database user ID from session (set by NextAuth callback)
        const userId = session.user?.id;
        const userEmail = session.user?.email;
        
        if (!userId) {
            return NextResponse.json(
                { error: "User identification failed" },
                { status: 401 }
            );
        }
        
        // Build query: primarily use database user ID, but also check for old records saved with email
        // (for backward compatibility with records created before User model was implemented)
        const userQuery = userEmail
            ? { $or: [{ userId: userId }, { userId: userEmail }] }
            : { userId: userId };
        
        const analysis = await Analysis.findOne({ 
            _id: id,
            ...userQuery
        }).lean();

        if (!analysis) {
            return NextResponse.json(
                { error: "Analysis not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            analysis: {
                _id: analysis._id.toString(),
                code: analysis.code,
                learningPath: analysis.learningPath,
                title: analysis.title,
                language: analysis.language,
                framework: analysis.framework
            }
        });
    } catch (error) {
        console.error("Error fetching analysis:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
