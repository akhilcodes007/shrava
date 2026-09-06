import { NextRequest, NextResponse } from "next/server";
import { AIProviderRouter } from "@/providers/ai/AIProviderRouter";
import { Message } from "@/providers/ai/types";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: Message[] = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
    }

    const router = new AIProviderRouter();
    
    // We will use streaming
    const stream = router.stream(messages);

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
          }
          controller.close();
        } catch (_err) {
          controller.enqueue(encoder.encode(JSON.stringify({ type: "error", error: "UNKNOWN" }) + "\n"));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });
  } catch (error: unknown) {
    console.error("AI API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
