import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsProvider } from "@/providers/voice/ElevenLabsProvider";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Invalid text" }, { status: 400 });
    }

    const provider = new ElevenLabsProvider();
    
    if (!provider.isConfigured()) {
      return NextResponse.json({ error: "ElevenLabs API key missing" }, { status: 500 });
    }

    const audioBuffer = await provider.synthesizeSpeech(text);

    return new Response(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
      }
    });
  } catch (error: unknown) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: "TTS generation failed" }, { status: 500 });
  }
}
