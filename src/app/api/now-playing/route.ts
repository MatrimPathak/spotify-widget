// src/app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

  // Re-hydrate the spotifyApi from cookies on every request so tokens survive
  // Vercel serverless cold starts (the .tokens.json file is not persisted there).
  const cookieStore = await cookies();
  const cookieAccessToken = cookieStore.get("access_token")?.value;
  const cookieRefreshToken = cookieStore.get("refresh_token")?.value;
  const cookieClientId = cookieStore.get("client_id")?.value;
  const cookieClientSecret = cookieStore.get("client_secret")?.value;
  const cookieRedirectUri = cookieStore.get("redirect_uri")?.value;

  if (cookieClientId) spotifyApi.setClientId(cookieClientId);
  if (cookieClientSecret) spotifyApi.setClientSecret(cookieClientSecret);
  if (cookieRedirectUri) spotifyApi.setRedirectURI(cookieRedirectUri);
  if (cookieAccessToken) spotifyApi.setAccessToken(cookieAccessToken);
  if (cookieRefreshToken) spotifyApi.setRefreshToken(cookieRefreshToken);

  if (!cookieAccessToken && !cookieRefreshToken) {
    return NextResponse.json({ error: "auth_expired" }, { status: 401 });
  }

  try {
    const data = await spotifyApi.getMyCurrentPlayingTrack();
    return NextResponse.json(data.body);
  } catch (error: unknown) {
    const statusCode = (error as { statusCode?: number })?.statusCode;

    if (statusCode === 401) {
      try {
        const refreshed = await spotifyApi.refreshAccessToken();
        const newAccessToken = refreshed.body.access_token;
        const newRefreshToken = refreshed.body.refresh_token;
        spotifyApi.setAccessToken(newAccessToken);
        saveTokens({
          access_token: newAccessToken,
          ...(newRefreshToken ? { refresh_token: newRefreshToken } : {}),
        });
        const retryData = await spotifyApi.getMyCurrentPlayingTrack();
        const response = NextResponse.json(retryData.body);
        response.cookies.set("access_token", newAccessToken, { httpOnly: true, sameSite: "lax" });
        if (newRefreshToken) {
          response.cookies.set("refresh_token", newRefreshToken, { httpOnly: true, sameSite: "lax" });
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

