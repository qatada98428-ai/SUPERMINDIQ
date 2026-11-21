import { NextRequest, NextResponse } from "next/server";

// Server-side in-memory audio cache for instant sub-millisecond response
const serverAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();
const MAX_CACHE_ITEMS = 800;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get("text")?.trim() || "";
  const lang = searchParams.get("lang") === "en" ? "en" : "ar";
  const gender = searchParams.get("gender") === "male" ? "male" : "female";

  if (!rawText) {
    return new NextResponse("Text parameter is required", { status: 400 });
  }

  // Limit length to avoid abuse
  const text = rawText.slice(0, 300);
  const cacheKey = `${lang}:${gender}:${text}`;

  // Check in-memory server cache
  if (serverAudioCache.has(cacheKey)) {
    const cached = serverAudioCache.get(cacheKey)!;
    return new Response(new Uint8Array(cached.buffer), {
      status: 200,
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, immutable",
        "X-Supermind-TTS-Source": "cache",
      },
    });
  }

  try {
    // Primary engine: Google Translate TTS (Reliable, fast, zero-auth, zero-cost, clear Classical Arabic pronunciation)
    const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`;
    const upstreamRes = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        Accept: "audio/mpeg, audio/*;q=0.9, */*;q=0.8",
      },
      next: { revalidate: 604800 },
    });

    if (!upstreamRes.ok) {
      throw new Error(`Upstream TTS returned HTTP ${upstreamRes.status}`);
    }

    const arrayBuf = await upstreamRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const contentType = upstreamRes.headers.get("content-type") || "audio/mpeg";

    // Manage LRU cache size
    if (serverAudioCache.size >= MAX_CACHE_ITEMS) {
      const firstKey = serverAudioCache.keys().next().value;
      if (firstKey) serverAudioCache.delete(firstKey);
    }
    serverAudioCache.set(cacheKey, { buffer, contentType });

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, s-maxage=2592000, immutable",
        "X-Supermind-TTS-Source": "upstream",
      },
    });
  } catch (err: unknown) {
    console.error("TTS generation error:", err);
    return new NextResponse("TTS generation failed", { status: 502 });
  }
}
