// src/lib/spotify.ts
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID!,       // Non-null assertion: ensure this is defined in your .env.local
  clientSecret: process.env.CLIENT_SECRET!, // Non-null assertion: ensure this is defined in your .env.local
  redirectUri: process.env.REDIRECT_URI!,   // Non-null assertion: ensure this is defined in your .env.local
});

export default spotifyApi;
