"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Vibrant } from "node-vibrant/browser";
import Image from "next/image";

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
		<div className="flex items-center gap-8 p-6 select-none">
			{/* Vinyl Record Section */}
			{hideAlbumArt && (
				<div className="relative group perspective-1000">
					{/* The Disk (behind the sleeve) */}
					<div 
						className={`absolute left-4 top-2 w-32 h-32 rounded-full vinyl-disk transition-all duration-700 ease-out z-0
							${trackData.is_playing ? "translate-x-16 animate-spin-slow" : "translate-x-0 animate-spin-slow-paused"}
							after:content-[''] after:absolute after:inset-0 after:rounded-full after:vinyl-shine
						`}
					>
						{/* Record Label */}
						<div className="absolute inset-[38%] rounded-full border border-black/20 overflow-hidden bg-black/40">
							<Image
								src={item.album.images[0].url}
								alt="Label"
								fill
								className="object-cover opacity-80"
							/>
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-2 h-2 bg-[#121212] rounded-full border border-white/10" />
							</div>
						</div>
					</div>

					{/* The Sleeve (Album Art) */}
					<div className="relative w-40 h-40 shadow-2xl z-20 rounded-sm overflow-hidden transform group-hover:scale-[1.02] transition-transform duration-300">
						<Image
							src={item.album.images[0].url}
							alt={item.name}
							fill
							className="object-cover"
							priority
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
					</div>
				</div>
			)}

			{/* Info Section */}

			<div className="flex flex-col gap-3 min-w-[320px] max-w-[400px]">
				<div className="glass rounded-2xl p-6 relative overflow-hidden">
					{/* Animated background glow based on theme color */}
					<div 
						className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-40 transition-colors duration-1000"
						style={{ backgroundColor: themeColor }}
					/>

					<div className="relative z-10 flex flex-col gap-1">
						<h1 className="text-2xl font-bold text-white tracking-tight line-clamp-1">
							{item.name}
						</h1>
						<div className="flex items-center gap-2">
							<p 
								className="text-sm font-medium tracking-wide uppercase opacity-90 line-clamp-1"
								style={{ color: themeColor }}
							>
								{artistNames}
							</p>
							<span className="text-white/30 truncate">•</span>
							<p className="text-xs font-semibold text-white/50 tracking-widest uppercase truncate max-w-[120px]">
								{item.album.name}
							</p>
						</div>
					</div>

					{/* Progress Section */}
					<div className="mt-6 flex flex-col gap-2 relative z-10">
						<div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
							<div
								className="h-full rounded-full transition-all duration-1000 ease-linear"
								style={{
									backgroundColor: themeColor,
									width: `${progressPercent}%`,
									boxShadow: `0 0 12px ${hexToRgba(themeColor, 0.5)}`
								}}
							/>
						</div>
						<div className="flex justify-between items-center px-0.5">
							<span className="text-[10px] font-bold text-white/40 tabular-nums tracking-wider uppercase">
								{formatTime(progress)}
							</span>
							<span className="text-[10px] font-bold text-white/40 tabular-nums tracking-wider uppercase">
								{formatTime(item.duration_ms)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

