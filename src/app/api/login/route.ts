// src/app/api/login/route.ts
import { NextResponse } from "next/server";
import SpotifyWebApi from "spotify-web-api-node";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const client_id = searchParams.get("client_id");
	const client_secret = searchParams.get("client_secret");
	const redirect_uri = searchParams.get("redirect_uri");

	if (!client_id || !client_secret || !redirect_uri) {
		return NextResponse.json(
			{ error: "Missing Spotify credentials in query parameters" },
			{ status: 400 }
		);
	}

	const scopes = [
		"user-read-private",
		"user-read-email",
		"user-read-playback-state",
		"user-modify-playback-state",
		"user-read-currently-playing",
	];

	// Create an instance with the provided credentials
	const spotifyApi = new SpotifyWebApi({
		clientId: client_id,
		clientSecret: client_secret,
		redirectUri: redirect_uri,
	});

	const state = "spotify-widget"; // For production, generate a secure random state.
	const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true);

	// Set cookies with the credentials so the callback can use them
	const response = NextResponse.redirect(authorizeURL);
	response.cookies.set("client_id", client_id);
	response.cookies.set("client_secret", client_secret);
	response.cookies.set("redirect_uri", redirect_uri);

	return response;
}
