import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.HUGGING_FACE_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Hugging Face API key not configured" }, { status: 500 });
    }

    console.log("HuggingFace prompt:", prompt);
    const response = await fetch(
      "https://huggingface.co/api/inference/v1/models/mistralai/Mistral-7B-Instruct-v0.3",
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      }
    );

    const result = await response.json();
    console.log("HuggingFace result type:", typeof result);
    
    // Hugging Face returns an array or an error object
    const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;

    if (!text) {
        throw new Error(result.error || "Failed to get response from Hugging Face");
    }

    // Clean up the response if it includes the prompt
    const cleanedText = text.replace(prompt, "").trim();

    return NextResponse.json({ 
      content: cleanedText || text, 
      model: "Mistral 7B v0.3",
      provider: "Hugging Face"
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch from Hugging Face";
    console.error("Hugging Face API Error:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
