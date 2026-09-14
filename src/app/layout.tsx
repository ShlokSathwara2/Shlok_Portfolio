import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shlok Sathwara | Software Engineer & AI Developer",
  description:
    "Portfolio of Shlok Sathwara — CS student at SRMIST, Software Engineer specializing in AI-powered full-stack applications, DSA, and cloud platforms.",
  keywords: [
    "Shlok Sathwara",
    "software engineer",
    "full-stack developer",
    "AI",
    "machine learning",
    "Next.js",
    "React",
    "Java",
    "Python",
    "portfolio",
  ],
  authors: [{ name: "Shlok Sathwara" }],
  openGraph: {
    title: "Shlok Sathwara | Software Engineer & AI Developer",
    description:
      "CS student at SRMIST building AI-powered apps. 10+ projects, Linde intern, Oracle APEX certified.",
    type: "website",
    url: "https://shlokportfolio.vercel.app",
    images: ["/profile.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shlok Sathwara | Software Engineer & AI Developer",
    description:
      "CS student at SRMIST building AI-powered apps. 10+ projects, Linde intern, Oracle APEX certified.",
    images: ["/profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-[family-name:var(--font-inter)]">
        {children}
      </body>
    </html>
  );
}
