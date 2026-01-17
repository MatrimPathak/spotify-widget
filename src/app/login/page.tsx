"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
	const [clientId, setClientId] = useState("");
	const [clientSecret, setClientSecret] = useState("");
	const [redirectUri, setRedirectUri] = useState("");
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// WARNING: Passing the client secret in the URL is not recommended for production apps.
		// This example is for demonstration purposes only.
		const queryParams = new URLSearchParams({
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
		}).toString();

		router.push(`/api/login?${queryParams}`);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-neutral-800">
			<h1 className="text-3xl mb-6 font-bold text-white">LOGIN TO SPOTIFY</h1>
			<form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
				<input
					type="password"
					placeholder="Client ID"
					value={clientId}
					onChange={(e) => setClientId(e.target.value)}
					className="p-2 rounded outline-none bg-neutral-700"
					required
				/>
				<input
					type="password"
					placeholder="Client Secret"
					value={clientSecret}
					onChange={(e) => setClientSecret(e.target.value)}
					className="p-2 rounded outline-none bg-neutral-700"
					required
				/>
				<input
					type="text"
					placeholder="Redirect URI"
					value={redirectUri}
					onChange={(e) => setRedirectUri(e.target.value)}
					className="p-2 rounded outline-none bg-neutral-700"
					required
				/>
				<button
					type="submit"
					className="bg-green-600 p-2 rounded hover:bg-green-700"
				>
					Login with Spotify
				</button>
			</form>
		</div>
	);
}
