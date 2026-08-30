import type { Metadata } from "next";
import { Geist, Geist_Mono, Jost } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "./components/site-footer";
import { AuthUserProvider } from "./components/auth-user-provider";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const jost = Jost({
	variable: "--font-jost",
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
	title: "Iqra international",
	description: "The best online Islamic courses for learning Quran, Hadith, Fiqh, and more. Structured learning paths designed for steady progress.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} ${jost.variable} antialiased`}
			>
				<AuthUserProvider>{children}</AuthUserProvider>
				<SiteFooter />
			</body>
		</html>
	);
}
