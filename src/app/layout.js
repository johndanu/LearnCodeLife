import { Poppins, Lora, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

// Helper function to get base URL for absolute URLs in metadata
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return process.env.NODE_ENV === 'production' 
    ? 'https://learncode.life' 
    : 'http://localhost:3000';
};

const baseUrl = getBaseUrl();

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | LearnCode.life',
    default: 'Explain My Code & Get a Roadmap | LearnCode.life',
  },
  description: 'Paste any code snippet and get a structured learning roadmap with AI-powered explanations. Discover programming concepts organized by difficulty levels with interactive explanations.',
  keywords: [
    'code analysis',
    'learning path',
    'code explainer',
    'programming roadmap',
    'code learning',
    'AI code analysis',
    'code education',
    'programming tutorial',
    'learn to code',
    'code breakdown'
  ],
  authors: [{ name: 'LearnCode Team' }],
  creator: 'LearnCode',
  publisher: 'LearnCode',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: 'LearnCode.life',
    title: 'Explain My Code & Get a Roadmap | LearnCode.life',
    description: 'Paste any code snippet and get a structured learning roadmap with AI-powered explanations. Discover programming concepts organized by difficulty levels.',
    images: [
      {
        url: `${baseUrl}/logo.png`,
        width: 1200,
        height: 630,
        alt: 'LearnCode.life - Code Logic Explainer and Learning Path Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explain My Code & Get a Roadmap | LearnCode.life',
    description: 'Paste any code snippet and get a structured learning roadmap with AI-powered explanations.',
    images: [`${baseUrl}/logo.png`],
    creator: '@learncode',
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${poppins.variable} ${lora.variable} ${jetbrainsMono.variable} h-full font-body`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
