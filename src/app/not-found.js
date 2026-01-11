import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden relative selection:bg-[hsl(var(--primary))] selection:text-white">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary))] opacity-5 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[hsl(var(--accent))] opacity-5 blur-[100px] rounded-full" />
            </div>

            <div className="container relative z-10 px-6 text-center max-w-md mx-auto">
                <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--secondary))] rounded-2xl p-8 shadow-xl">
                    {/* Logo */}
                    <div className="mb-6 flex justify-center">
                        <Image 
                            src="/logo.png" 
                            alt="LearnCode Logo" 
                            width={80} 
                            height={80} 
                            className="w-20 h-20 rounded-xl shadow-lg"
                            priority
                        />
                    </div>

                    {/* 404 Number */}
                    <div className="mb-4">
                        <h1 className="text-8xl font-bold text-[hsl(var(--primary))] tracking-tight">
                            404
                        </h1>
                    </div>

                    <h2 className="text-3xl font-bold tracking-tight mb-2">
                        Page Not Found
                    </h2>
                    <p className="text-sm text-[hsl(var(--text-muted))] mb-8">
                        The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Link
                            href="/"
                            className="w-full px-6 py-3 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </Link>

                        <Link
                            href="/code"
                            className="w-full px-6 py-3 rounded-xl bg-[hsl(var(--surface))] border border-[hsl(var(--secondary))] text-[hsl(var(--text-main))] font-semibold text-base hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                            Go to Code Editor
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
