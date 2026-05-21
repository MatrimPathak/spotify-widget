import { NextResponse } from "next/server";
import spotifyApi from "@/app/lib/spotify";

function encodeVarint(n: number): number[] {
  const out: number[] = [];
  while (n >= 0x80) { out.push((n & 0x7f) | 0x80); n >>>= 7; }
  out.push(n & 0x7f);
  return out;
}

function makeField(fieldNumber: number, data: Uint8Array): Uint8Array {
  const tag = (fieldNumber << 3) | 2;
  return new Uint8Array([tag, ...encodeVarint(data.length), ...data]);
}

function buildCanvasRequest(trackId: string): Uint8Array {
  const uri = new TextEncoder().encode(`spotify:track:${trackId}`);
  const trackMsg = makeField(1, uri);       // Track.track_uri = field 1
  return makeField(1, trackMsg);            // EntityCanvazRequest.tracks = field 1
}

function extractCanvasUrl(bytes: Uint8Array): string | null {
  // Scan for canvas CDN URLs in the protobuf binary response
  const text = new TextDecoder("latin1").decode(bytes);
  const m = text.match(/https:\/\/[\w.\-/]+\.cnvs\.mp4/);
  return m ? m[0] : null;
}

async function fetchWithToken(trackId: string, token: string): Promise<string | null> {
  const res = await fetch("https://spclient.wg.spotify.com/canvaz-cache/v0/canvases", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/x-protobuf",
      "Accept": "application/x-protobuf",
      "spotify-app-version": "8.9.42.596",
      "app-platform": "WebPlayer",
    },
    body: buildCanvasRequest(trackId),
  });
  if (!res.ok) return null;
  const buf = new Uint8Array(await res.arrayBuffer());
  return extractCanvasUrl(buf);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const trackId = searchParams.get("trackId");
  if (!trackId || trackId === "demo_blinding_lights") {
    return NextResponse.json({ url: null });
  }

  try {
    let token = spotifyApi.getAccessToken();
    if (!token) {
      const refreshed = await spotifyApi.refreshAccessToken();
      spotifyApi.setAccessToken(refreshed.body.access_token);
      token = refreshed.body.access_token;
    }

    const url = await fetchWithToken(trackId, token as string);
    if (url) return NextResponse.json({ url });

    // Retry once with a fresh token
    const refreshed = await spotifyApi.refreshAccessToken();
    spotifyApi.setAccessToken(refreshed.body.access_token);
    const url2 = await fetchWithToken(trackId, refreshed.body.access_token);
    return NextResponse.json({ url: url2 });
  } catch {
    return NextResponse.json({ url: null });
  }
}
