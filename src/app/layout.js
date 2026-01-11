import { Poppins, Lora, JetBrains_Mono } from "next/font/google";
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

export const metadata = {
  title: "LearnCode - Master the Future",
  description: "The ultimate platform to learn coding with style.",
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
      </body>
    </html>
  );
}
