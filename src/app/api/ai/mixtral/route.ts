import Groq from "groq-sdk";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, history = [] } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Groq API key not configured" }, { status: 500 });
    }

    const groq = new Groq({ apiKey });

    const messages = [
      ...history.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: prompt }
    ];

    const completion = await groq.chat.completions.create({
      messages,
      model: "llama-3.1-8b-instant",
    });

    return NextResponse.json({ 
      content: completion.choices[0]?.message?.content || "No response", 
      model: "Llama 3.1 8B",
      provider: "Groq"
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch from Llama 3.1";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
