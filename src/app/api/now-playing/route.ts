// src/app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import { resolveCreds, makeClient, refreshClient } from "@/app/lib/widgetAuth";

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

  const creds = await resolveCreds(req);
  if (!creds) {
    return NextResponse.json({ error: "auth_expired" }, { status: 401 });
  }
  const api = makeClient(creds);
  const fromKey = new URL(req.url).searchParams.has("key");

  try {
    if (!api.getAccessToken()) await refreshClient(api, creds);
    const data = await api.getMyCurrentPlayingTrack();
    return NextResponse.json(data.body);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;

    if (statusCode === 401) {
      try {
        const { accessToken, refreshToken } = await refreshClient(api, creds);
        const retryData = await api.getMyCurrentPlayingTrack();
        const response = NextResponse.json(retryData.body);
        if (!fromKey) {
          response.cookies.set("access_token", accessToken, { httpOnly: true, sameSite: "lax" });
          if (refreshToken) {
            response.cookies.set("refresh_token", refreshToken, { httpOnly: true, sameSite: "lax" });
          }
        }
        return response;
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
