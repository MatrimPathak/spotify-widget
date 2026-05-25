// src/lib/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';
import { loadTokens } from './tokenStore';

const stored = loadTokens();

const spotifyApi = new SpotifyWebApi({
  clientId: stored.client_id || process.env.CLIENT_ID || '',
  clientSecret: stored.client_secret || process.env.CLIENT_SECRET || '',
  redirectUri: stored.redirect_uri || process.env.REDIRECT_URI || '',
});

if (stored.access_token) spotifyApi.setAccessToken(stored.access_token);
if (stored.refresh_token) spotifyApi.setRefreshToken(stored.refresh_token);

export default spotifyApi;
