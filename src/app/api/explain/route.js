import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "../../../lib/mongodb";
import Analysis from "../../../models/Analysis";
import TopicExplanation from "../../../models/TopicExplanation";

const MODEL = process.env.OPENROUTER_MODEL || "deepseek/deepseek-chat";
const API_URL = "https://openrouter.ai/api/v1/chat/completions";

async function explainTopic(topic, analysisId = null, levelName = null) {
  let language = "programming";
  let framework = null;

  await connectDB();

  if (analysisId) {
    try {
      const analysis = await Analysis.findById(analysisId).lean();
      if (analysis?.language) language = analysis.language;
      if (analysis?.framework) framework = analysis.framework;
    } catch (err) {
      console.error("Error fetching analysis for context:", err);
    }
  }

  // 1. Check if explanation already exists in DB
  try {
    const existing = await TopicExplanation.findOne({
      topic: topic.trim(),
      language,
      framework
    }).lean();

    if (existing) {
      console.log(`[Cache Hit] Topic: ${topic}`);
      return existing.explanation;
    }
  } catch (dbErr) {
    console.error("Database cache lookup failed:", dbErr);
  }

  // 2. Not in DB, fetch from LLM
  console.log(`[Cache Miss] Fetching from LLM: ${topic}`);
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return `${topic} is an important programming concept. 
Configure OPENROUTER_API_KEY to enable AI explanations.`;
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
        max_tokens: 400, // Increased for code blocks
        messages: [
          {
            role: "system",
            content:
              "You are a programming tutor. Respond in EXACTLY 60 words or less. Be clear, simple, and practical. No headings. Use markdown ONLY for code blocks (```language) or inline code (`code`) if helpful. Be concise."
          },
          {
            role: "user",
            content: `Explain "${topic}"${levelName ? ` in the context of ${levelName}` : ''}${framework ? ` using ${framework}` : ''} in ${language}. Keep it beginner-friendly, practical, include a tiny code example if possible, and keep it under 60 words.`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices[0]?.message?.content?.trim();

    if (explanation) {
      // 3. Save to DB for future use
      try {
        await TopicExplanation.findOneAndUpdate(
          { topic: topic.trim(), language, framework },
          { explanation },
          { upsert: true, new: true }
        );
      } catch (saveErr) {
        console.error("Failed to save explanation to DB:", saveErr);
      }
      return explanation;
    }

    throw new Error("Empty response from AI service");
  } catch (err) {
    console.error("Error explaining topic:", err);
    return `${topic} is a key concept in ${language}. Could not fetch detailed explanation at this time.`;
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
