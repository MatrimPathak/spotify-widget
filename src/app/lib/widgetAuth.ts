// Auth helpers that let widgets work in browsers without the login cookies
// (e.g. OBS browser sources, which have their own isolated cookie jar).
//
// The settings page asks /api/widget-key for an encrypted "key" containing the
// Spotify app credentials + refresh token. That key is appended to the OBS URL
// as `?key=...` and forwarded by the widget to the API routes.
import crypto from "crypto";
import SpotifyWebApi from "spotify-web-api-node";
import { cookies } from "next/headers";
import spotifyApi from "@/app/lib/spotify";

export interface WidgetCreds {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  refreshToken: string;
  accessToken?: string;
}

// Set WIDGET_KEY_SECRET in your deployment env for real secrecy. The fallback
// keeps the feature working out of the box but only obfuscates the key.
function secretKey(): Buffer {
  const secret = process.env.WIDGET_KEY_SECRET || "spotify-widget-default-key-secret";
  return crypto.createHash("sha256").update(secret).digest();
}

export function encodeWidgetKey(c: Omit<WidgetCreds, "accessToken">): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", secretKey(), iv);
  const payload = JSON.stringify([c.clientId, c.clientSecret, c.redirectUri, c.refreshToken]);
  const enc = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64url");
}

export function decodeWidgetKey(key: string): Omit<WidgetCreds, "accessToken"> | null {
  try {
    const buf = Buffer.from(key, "base64url");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const enc = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", secretKey(), iv);
    decipher.setAuthTag(tag);
    const dec = Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
    const [clientId, clientSecret, redirectUri, refreshToken] = JSON.parse(dec);
    if (!clientId || !clientSecret || !refreshToken) return null;
    return { clientId, clientSecret, redirectUri: redirectUri || "", refreshToken };
  } catch {
    return null;
  }
}

/** Credentials from the `key` query param, falling back to login cookies. */
export async function resolveCreds(req: Request): Promise<WidgetCreds | null> {
  const key = new URL(req.url).searchParams.get("key");
  if (key) return decodeWidgetKey(key);

  const store = await cookies();
  const refreshToken = store.get("refresh_token")?.value;
  const accessToken = store.get("access_token")?.value;
  const clientId = store.get("client_id")?.value || spotifyApi.getClientId();
  const clientSecret = store.get("client_secret")?.value || spotifyApi.getClientSecret();
  const redirectUri = store.get("redirect_uri")?.value || spotifyApi.getRedirectURI() || "";
  if (!clientId || !clientSecret || (!refreshToken && !accessToken)) return null;
  return { clientId, clientSecret, redirectUri, refreshToken: refreshToken || "", accessToken };
}

// Access tokens cached per refresh token so key-based widgets don't refresh
// on every poll (survives as long as the serverless instance is warm).
const tokenCache = new Map<string, { token: string; exp: number }>();

export function makeClient(c: WidgetCreds): SpotifyWebApi {
  const api = new SpotifyWebApi({
    clientId: c.clientId,
    clientSecret: c.clientSecret,
    redirectUri: c.redirectUri,
  });
  if (c.refreshToken) api.setRefreshToken(c.refreshToken);
  const cached = c.refreshToken ? tokenCache.get(c.refreshToken) : undefined;
  const token = c.accessToken || (cached && cached.exp > Date.now() ? cached.token : undefined);
  if (token) api.setAccessToken(token);
  return api;
}

/** Refreshes the access token on `api` and returns it (plus a rotated refresh token, if any). */
export async function refreshClient(api: SpotifyWebApi, c: WidgetCreds) {
  const r = await api.refreshAccessToken();
  const accessToken = r.body.access_token;
  api.setAccessToken(accessToken);
  if (c.refreshToken) {
    tokenCache.set(c.refreshToken, {
      token: accessToken,
      exp: Date.now() + (r.body.expires_in - 60) * 1000,
    });
  }
  return { accessToken, refreshToken: r.body.refresh_token };
}
