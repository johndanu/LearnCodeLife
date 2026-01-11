import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import connectDB from '../../../lib/mongodb';
import Analysis from '../../../models/Analysis';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

const MASTER_PROMPT = `You are an expert programming tutor. Analyze the provided code and return a JSON object with this exact structure:
{
  "title": "A concise title for this code analysis (e.g., 'JavaScript React Component Learning Path')",
  "language": "The programming language detected (e.g., 'JavaScript', 'Python', 'TypeScript')",
  "framework": "The framework or library detected, or null if none (e.g., 'React', 'Express', null)",
  "learningPath": "A structured learning path with exactly 3 levels, formatted as:\nLevel 1: [Level Name]\n- Topic 1\n- Topic 2\n- Topic 3\n\nLevel 2: [Level Name]\n- Topic 1\n- Topic 2\n- Topic 3\n\nLevel 3: [Level Name]\n- Topic 1\n- Topic 2\n- Topic 3"
}

Each level should have 3-5 topics. The learning path should be progressive, starting with fundamentals and building to advanced concepts.`;

export async function POST(request) {
  try {
    /* ---------- AUTH ---------- */
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    /* ---------- BODY ---------- */
    let code;
    try {
      const body = await request.json();
      code = body.code;
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().slice(0, 800);

    /* ---------- AI CALL (SINGLE) ---------- */
    const completion = await openai.chat.completions.create({
      model: process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat',
      temperature: 0.2,
      max_tokens: 1500,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: MASTER_PROMPT },
        { role: 'user', content: trimmedCode }
      ],
    });

    const aiResult = JSON.parse(
      completion.choices[0].message.content
    );

    /* ---------- DB ---------- */
    await connectDB();

    // Use database user ID from session (set by NextAuth callback)
    // This is the _id from the User collection in the database
    const userId = session.user?.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User identification failed' },
        { status: 401 }
      );
    }

    const analysisData = {
      userId: userId,
      code: trimmedCode,
      title: aiResult.title || 'Code Analysis',
      language: aiResult.language || 'Unknown',
      framework: aiResult.framework || null,
      learningPath: aiResult.learningPath,
    };

    /* ---------- DB SAVE ---------- */
    let savedAnalysis;
    try {
      savedAnalysis = await Analysis.create(analysisData);
    } catch (dbError) {
      console.error('DB save failed:', dbError);
      // Continue even if DB save fails, but return without id
    }

    /* ---------- RESPONSE ---------- */
    return NextResponse.json({
      title: analysisData.title,
      language: analysisData.language,
      framework: analysisData.framework,
      learningPath: analysisData.learningPath,
      ...(savedAnalysis && { id: savedAnalysis._id.toString() }),
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze code',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
