import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

// This is a placeholder - you'll need to integrate with your AI service
async function explainTopic(topic) {
    // TODO: Replace with actual AI service call
    // Example:
    // const response = await fetch('https://api.openai.com/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    //     },
    //     body: JSON.stringify({
    //         model: 'gpt-4',
    //         messages: [{ role: 'user', content: `Explain ${topic} in detail.` }]
    //     })
    // });
    
    // Mock response for now
    return `This is a placeholder explanation for "${topic}". 

To get real explanations, you'll need to:
1. Set up an AI service (OpenAI, Anthropic, etc.)
2. Add your API key to environment variables
3. Implement the API call in this function

The explanation should be clear, concise, and educational.`;
}

export async function POST(request) {
    try {
        // Check authentication
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { topic } = await request.json();

        if (!topic || !topic.trim()) {
            return NextResponse.json(
                { error: "Topic is required" },
                { status: 400 }
            );
        }

        const explanation = await explainTopic(topic);

        return NextResponse.json({
            explanation
        });
    } catch (error) {
        console.error("Explanation error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
