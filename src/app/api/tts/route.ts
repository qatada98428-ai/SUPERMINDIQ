import { NextRequest, NextResponse } from "next/server";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// Server-side in-memory audio cache for instant sub-millisecond response
const serverAudioCache = new Map<string, { buffer: Buffer; contentType: string }>();
const MAX_CACHE_ITEMS = 1200;

const VOICE_MAP: Record<string, Record<string, string>> = {
  ar: {
    male: "ar-SA-HamedNeural", // صوت رجل وقور وعميق (سعودي فصحى)
    male_2: "ar-EG-ShakirNeural", // صوت رجل شبابي وحيوي (مصري فصحى)
    female: "ar-SA-ZariyahNeural", // صوت امرأة فائق النقاء (سعودي فصحى)
  },
  en: {
    male: "en-US-GuyNeural",
    male_2: "en-US-ChristopherNeural",
    female: "en-US-JennyNeural",
  },
};

async function synthesizeWithEdge(text: string, voiceName: string): Promise<Buffer> {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
  return new Promise((resolve, reject) => {
    const { audioStream } = tts.toStream(text);
    const chunks: Buffer[] = [];
    audioStream.on("data", (chunk: Buffer) => chunks.push(chunk));
    audioStream.on("end", () => resolve(Buffer.concat(chunks)));
    audioStream.on("error", (err: Error) => reject(err));
    setTimeout(() => {
      try {
        audioStream.destroy();
      } catch {
        // ignore
      }
      reject(new Error("Edge TTS request timed out"));
    }, 4500);
  });
}

async function fallbackGoogleTts(text: string, lang: string): Promise<Buffer> {
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
    throw new Error(`Upstream Google TTS returned HTTP ${upstreamRes.status}`);
  }

  const arrayBuf = await upstreamRes.arrayBuffer();
  return Buffer.from(arrayBuf);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawText = searchParams.get("text")?.trim() || "";
  const lang = searchParams.get("lang") === "en" ? "en" : "ar";
  const rawGender = searchParams.get("gender") || "male";
  const gender =
    rawGender === "female"
      ? "female"
      : rawGender === "male_2"
      ? "male_2"
      : "male";

  if (!rawText) {
    return new NextResponse("Text parameter is required", { status: 400 });
  }

  // Limit length to avoid abuse
  const text = rawText.slice(0, 300);
  const cacheKey = `${lang}:${gender}:${text}`;

  // Check in-memory server cache for instantaneous reply
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
    const voiceName =
      VOICE_MAP[lang]?.[gender] || (gender === "female" ? "ar-SA-ZariyahNeural" : "ar-SA-HamedNeural");

    let buffer: Buffer;
    let source = "edge-neural";

    try {
      buffer = await synthesizeWithEdge(text, voiceName);
    } catch (edgeErr) {
      console.warn("Edge Neural TTS failed, falling back to Google TTS:", edgeErr);
      buffer = await fallbackGoogleTts(text, lang);
      source = "google-fallback";
    }

    const contentType = "audio/mpeg";

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
        "X-Supermind-TTS-Source": source,
      },
    });
  } catch (err: unknown) {
    console.error("TTS generation error:", err);
    return new NextResponse("TTS generation failed", { status: 502 });
  }
}
