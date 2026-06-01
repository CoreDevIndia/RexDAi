import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { prompt, history = [] } = await req.json();
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Convert history to Gemini v1 API format
    const contents = [
      ...history.map((msg: any) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
      { role: "user", parts: [{ text: prompt }] }
    ];

    // Using the stable v1 endpoint and gemini-1.5-flash which is the most reliable free model
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contents }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini v1 API Error Details:", data);
      throw new Error(data.error?.message || "Failed to fetch from Gemini");
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        throw new Error("Empty response from Gemini");
    }

    return NextResponse.json({ 
      content: text, 
      model: "Gemini 1.5 Flash",
      provider: "Google"
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch from Gemini";
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
