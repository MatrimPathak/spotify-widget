// src/app/api/now-playing/route.ts
import { NextResponse } from "next/server";
import spotifyApi from "@/app/lib/spotify";

// export async function GET(request: Request) {
export async function GET() {
	try {
		const data = await spotifyApi.getMyCurrentPlayingTrack();
		return NextResponse.json(data.body);
	} catch (error) {
		console.error("Error fetching now playing track:", error);
		return NextResponse.json(
			{ error: "Failed to fetch now playing track" },
			{ status: 500 },
		);
	}
}
