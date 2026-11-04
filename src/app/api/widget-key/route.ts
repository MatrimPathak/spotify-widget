// Returns an encrypted key the settings page appends to widget URLs, so the
// widget can authenticate in browsers without login cookies (e.g. OBS).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import spotifyApi from "@/app/lib/spotify";
import { encodeWidgetKey } from "@/app/lib/widgetAuth";

export async function GET() {
  const store = await cookies();
  const refreshToken = store.get("refresh_token")?.value;
  const clientId = store.get("client_id")?.value || spotifyApi.getClientId();
  const clientSecret = store.get("client_secret")?.value || spotifyApi.getClientSecret();
  const redirectUri = store.get("redirect_uri")?.value || spotifyApi.getRedirectURI() || "";

  if (!refreshToken || !clientId || !clientSecret) {
    return NextResponse.json({ error: "auth_expired" }, { status: 401 });
  }

  const key = encodeWidgetKey({ clientId, clientSecret, redirectUri, refreshToken });
  return NextResponse.json({ key }, { headers: { "Cache-Control": "no-store" } });
}
