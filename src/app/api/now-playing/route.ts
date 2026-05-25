// src/app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import spotifyApi from "@/app/lib/spotify";
import { saveTokens } from "@/app/lib/tokenStore";

const DEMO_DATA = {
  item: {
    id: "demo_blinding_lights",
    name: "Blinding Lights",
    artists: [{ name: "The Weeknd" }],
    album: {
      images: [{ url: "https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526" }],
      name: "After Hours",
    },
    duration_ms: 200040,
  },
  progress_ms: 67000,
  is_playing: true,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("demo") === "true") {
    return NextResponse.json(DEMO_DATA);
  }

  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    return NextResponse.json(data.body);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;

    if (statusCode === 401) {
      try {
        const refreshed = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(refreshed.body.access_token);
        saveTokens({
          access_token: refreshed.body.access_token,
          ...(refreshed.body.refresh_token ? { refresh_token: refreshed.body.refresh_token } : {}),
        });
        const retryData = await spotifyApi.getMyCurrentPlayingTrack();
        return NextResponse.json(retryData.body);
      } catch {
        return NextResponse.json({ error: "auth_expired" }, { status: 401 });
      }
    }

    console.error("Error fetching now playing track:", error);
    return NextResponse.json(
      { error: "Failed to fetch now playing track" },
      { status: 500 },
    );
  }
}

