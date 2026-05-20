// src/app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import spotifyApi from "@/app/lib/spotify";

export async function GET() {
  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    return NextResponse.json(data.body);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;

    if (statusCode === 401) {
      try {
        const refreshed = await spotifyApi.refreshAccessToken();
        spotifyApi.setAccessToken(refreshed.body.access_token);
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
