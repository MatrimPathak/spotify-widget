// src/app/layout.tsx
import "@/app/globals.css";

export const metadata = {
	title: "Spotify Widget",
	description: "A Next.js Spotify Widget",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="">{children}</body>
		</html>
	);
}
