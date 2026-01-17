"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Vibrant } from "node-vibrant/browser";

interface Artist {
	name: string;
}

interface AlbumImage {
	url: string;
}

interface Album {
	images: AlbumImage[];
	name: string;
}

interface Track {
	id: string;
	name: string;
	artists: Artist[];
	album: Album;
	duration_ms: number;
}

interface NowPlayingResponse {
	item: Track | null;
	progress_ms: number;
	is_playing: boolean;
}

export default function NowPlayingPage() {
	const searchParams = useSearchParams();
	// If the URL param hideAlbumArt is "false" (ignoring case), then album art will be hidden; defaults to true.
	const hideAlbumArt =
		searchParams.get("hideAlbumArt")?.toLowerCase() !== "true";

	const [trackData, setTrackData] = useState<NowPlayingResponse | null>(null);
	const [progress, setProgress] = useState<number>(0);
	const [themeColor, setThemeColor] = useState<string>("#000"); // default background

	const fetchNowPlaying = async () => {
		try {
			const res = await fetch("/api/now-playing");
			const data: NowPlayingResponse = await res.json();
			setTrackData(data);
			if (data.progress_ms) {
				setProgress(data.progress_ms);
			}
		} catch (err) {
			console.error("Error fetching now playing:", err);
		}
	};

	useEffect(() => {
		fetchNowPlaying();
		const interval = setInterval(fetchNowPlaying, 1000);
		return () => clearInterval(interval);
	}, []);

	// Extract dominant color from the album art when trackData updates.
	useEffect(() => {
		if (trackData && trackData.item && trackData.is_playing) {
			const imgUrl = trackData.item.album.images[0].url;
			Vibrant.from(imgUrl)
				.getPalette()
				.then((palette) => {
					const dominantColor = palette.Vibrant?.hex || "#1f2937";
					setThemeColor(dominantColor);
				})
				.catch((err) => {
					console.error("Error extracting color:", err);
					setThemeColor("#1f2937");
				});
		}
	}, [trackData]);

	const formatTime = (ms: number): string => {
		const minutes = Math.floor(ms / 60000);
		const seconds = Math.floor((ms % 60000) / 1000);
		return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
	};

	// If no track is playing or the song is paused, show a message.
	if (!trackData || !trackData.item || !trackData.is_playing) {
		return (
			<div className="flex text-white min-h-screen">
				<div className="w-32 h-32 rounded-full bg-gray-900 mr-5"></div>
				<div className="h-32 w-96 bg-gray-900 rounded-lg flex items-center justify-center">
					<p className="text-center text-lg font-semibold">
						No Song is playing currently
					</p>
				</div>
			</div>
		);
	}

	const item = trackData.item;
	const artistNames = item.artists
		.slice(0, 3)
		.map((artist) => artist.name)
		.join(", ");
	const progressPercent = (progress / item.duration_ms) * 100;

	// Helper to convert hex to RGBA with a given opacity.
	function hexToRgba(hex: string, opacity: number): string {
		hex = hex.replace("#", "");
		if (hex.length === 3) {
			hex = hex
				.split("")
				.map((char) => char + char)
				.join("");
		}
		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);
		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}

	return (
		<div className="flex w-fit text-white">
			{hideAlbumArt && (
				<div className="relative w-32 h-32 rounded-full mr-5 overflow-hidden">
					<img
						src={item.album.images[0].url}
						alt={item.name}
						className="w-32 h-32 rounded-full animate-spin"
						style={{
							border: `4px solid ${themeColor}`,
							animationDuration: "3s",
						}}
					/>
					<div className="absolute inset-0 flex items-center justify-center pointer-events-none">
						<div className="size-4 bg-white rounded-full border-4 border-black" />
					</div>
				</div>
			)}
			<div className="relative">
				<div
					className="absolute h-32 w-96 rounded-lg"
					style={{
						backgroundImage: `url(${item.album.images[0].url})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
					}}
				>
					<div className="backdrop-blur-md h-32 w-96 rounded-lg bg-black/30"></div>
				</div>
				<div className="px-4 py-2 rounded-lg w-96 relative z-10">
					<p className="text-lg font-semibold">{item.name}</p>
					<p
						className="text-md font-medium text-ellipsis"
						style={{ color: hexToRgba(themeColor, 1) }}
					>
						{artistNames}
					</p>
					<p className="text-sm font-normal">{item.album.name}</p>
					<div className="flex items-center mt-2">
						<p
							className="text-sm font-normal mr-2"
							style={{ color: hexToRgba(themeColor, 1) }}
						>
							{formatTime(progress)}
						</p>
						<div className="w-full bg-gray-200 rounded-full h-1 m-2">
							<div
								className="h-1 rounded-full"
								style={{
									backgroundColor: hexToRgba(themeColor, 1),
									width: `${progressPercent}%`,
								}}
							></div>
						</div>
						<p
							className="text-sm font-norma ml-2"
							style={{ color: hexToRgba(themeColor, 1) }}
						>
							{formatTime(item.duration_ms)}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
