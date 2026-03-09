
const YT_QUALITIES = [
  "maxresdefault",
  "sddefault",
  "hqdefault",
  "mqdefault",
  "default",
] as const;

type YouTubeQuality = (typeof YT_QUALITIES)[number];

function isValidQuality(value: string | undefined): value is YouTubeQuality {
  return !!value && (YT_QUALITIES as readonly string[]).includes(value);
}

function buildYouTubeUrl(videoId: string, quality: YouTubeQuality) {
  return `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/${quality}.jpg`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug: slugFromParams } = await params;
  const slug = slugFromParams || [];
  const [videoId, requestedQuality] = slug;

  if (!videoId) {
    return NextResponse.json(
      { error: "Missing video id" },
      {
        status: 400,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }

  const qualitiesToTry: YouTubeQuality[] = isValidQuality(requestedQuality)
    ? [requestedQuality, ...YT_QUALITIES.filter((q) => q !== requestedQuality)]
    : [...YT_QUALITIES];

  let lastErrorMessage: string | null = null;
  for (const quality of qualitiesToTry) {
    const url = buildYouTubeUrl(videoId, quality);
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; Qunt EdgeBot/1.0; +https://qunt-edge.vercel.app)",
        },
        next: { revalidate: 60 * 60 * 24 },
      });

      if (!res.ok) {
        lastErrorMessage = `Upstream responded ${res.status}`;
        continue;
      }

      const contentType = res.headers.get("content-type") || "image/jpeg";
      const buffer = await res.arrayBuffer();

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
          "CDN-Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
          "Vercel-CDN-Cache-Control":
            "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      });
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : "Failed to fetch thumbnail";
      continue;
    }
  }

  const message = lastErrorMessage || "Failed to fetch thumbnail";
  return NextResponse.json(
    { error: message },
    {
      status: 502,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  );
}
import { NextResponse } from "next/server";
