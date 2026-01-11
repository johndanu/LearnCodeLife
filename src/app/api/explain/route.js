import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../../lib/mongodb";
import Analysis from "../../../models/Analysis";

const MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function explainTopic(topic, analysisId = null, levelName = null) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return `${topic} is an important programming concept. 
Configure OPENROUTER_API_KEY to enable AI explanations.`;
  }

  let language = "programming";
  let framework = null;
  if (analysisId) {
    try {
      await connectDB();
      const analysis = await Analysis.findById(analysisId).lean();
      if (analysis?.language) language = analysis.language;
      if (analysis?.framework) framework = analysis.framework;
    } catch {}
  }

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
        "X-Title": "LearnCode - Topic Explanation"
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.3,
        max_tokens: 200,
        messages: [
          {
            role: "system",
            content:
              "You are a programming tutor. Respond in EXACTLY 50 words or less. Be clear, simple, and practical. No headings. No markdown."
          },
          {
            role: "user",
            content: `Explain "${topic}"${levelName ? ` in the context of ${levelName}` : ''}${framework ? ` using ${framework}` : ''} in ${language}. Keep it beginner-friendly, practical, and under 50 words.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      console.error("OpenRouter API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        model: MODEL
      });
      throw new Error(`OpenRouter API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data || !data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
      console.error("Invalid response structure from OpenRouter:", data);
      throw new Error("Invalid response structure from AI service");
    }

    const explanation = data.choices[0]?.message?.content;
    
    if (!explanation || !explanation.trim()) {
      console.error("Empty explanation received:", data);
      throw new Error("No explanation content received from AI service");
    }

    return explanation.trim();
  } catch (err) {
    console.error("Error explaining topic:", {
      topic,
      levelName,
      language,
      model: MODEL,
      error: err.message,
      stack: err.stack
    });
    
    // Return a more helpful error message
    const errorMsg = err.message || "Unknown error";
    return `${topic} is a key concept in ${language}. 

Error: ${errorMsg}

Please check:
- OPENROUTER_API_KEY is set correctly
- The API key has sufficient credits
- Network connection is stable`;
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topic, analysisId, levelName } = await request.json();
    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const explanation = await explainTopic(topic, analysisId, levelName);
    return NextResponse.json({ explanation });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
