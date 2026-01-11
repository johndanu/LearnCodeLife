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

        const { id } = params;

        if (!id) {
            return NextResponse.json(
                { error: "Analysis ID is required" },
                { status: 400 }
            );
        }

        // Connect to database
        await connectDB();

        // Fetch from database - ensure the analysis belongs to the user
        const userId = session.user.id || session.user.email;
        const analysis = await Analysis.findOne({ 
            _id: id,
            userId: userId 
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
