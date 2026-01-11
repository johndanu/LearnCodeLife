import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "../components/AuthProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "LearnCode - Master the Future",
  description: "The ultimate platform to learn coding with style.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} h-full`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
