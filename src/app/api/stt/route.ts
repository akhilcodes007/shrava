import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsProvider } from "@/providers/voice/ElevenLabsProvider";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get("file") as Blob;

    if (!audioBlob) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    const provider = new ElevenLabsProvider();
    
    if (!provider.isConfigured()) {
      return NextResponse.json({ error: "ElevenLabs API key missing" }, { status: 500 });
    }

    const transcript = await provider.transcribeAudio(audioBlob);

    return NextResponse.json({ transcript });
  } catch (error: unknown) {
    console.error("STT API Error:", error);
    return NextResponse.json({ error: "STT processing failed" }, { status: 500 });
  }
}
