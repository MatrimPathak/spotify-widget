// src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
	return (
		<main className="flex flex-col items-center justify-center min-h-screen text-white bg-neutral-700">
			<h1 className="text-4xl font-bold mb-8">Spotify Widget</h1>
			<Link href="/login" prefetch={false}>
				<span className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-lg font-semibold cursor-pointer">
					Enter Your Spotify Credentials
				</span>
			</Link>
		</main>
	);
}
