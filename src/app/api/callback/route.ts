// src/app/api/callback/route.ts
import { NextResponse } from "next/server";
import spotifyApi from "@/app/lib/spotify";

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const code = searchParams.get("code");
	const error = searchParams.get("error");
	// const state = searchParams.get("state");

	if (error) {
		console.error("Spotify callback error:", error);
		return NextResponse.json({ error }, { status: 400 });
	}

	if (!code) {
		return NextResponse.json(
			{ error: "No code provided" },
			{ status: 400 },
		);
	}

	try {
		const data = await spotifyApi.authorizationCodeGrant(code);
		// const { access_token, refresh_token, expires_in } = data.body;
		const { access_token, refresh_token } = data.body;

		// Set tokens on the shared Spotify API client
		spotifyApi.setAccessToken(access_token);
		spotifyApi.setRefreshToken(refresh_token);

		// Redirect to /now-playing:
		return NextResponse.redirect(new URL("/now-playing", request.url));
	} catch (err) {
		console.error("Error during callback:", err);
		return NextResponse.json(
			{ error: "Something went wrong!" },
			{ status: 500 },
		);
	}
}
