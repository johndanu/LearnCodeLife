"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const errorMessages = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
};

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const errorMessage = errorMessages[error] || errorMessages.Default;

    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden relative">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary))] opacity-5 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[hsl(var(--accent))] opacity-5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 text-center max-w-md mx-auto px-6">
                <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--secondary))] rounded-2xl p-8 shadow-xl">
                    <div className="mb-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
                        <p className="text-[hsl(var(--text-muted))]">{errorMessage}</p>
                    </div>

                    {error === "Configuration" && (
                        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-left">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                                <strong>Configuration Error:</strong> Please check your environment variables:
                            </p>
                            <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
                                <li>GOOGLE_CLIENT_ID</li>
                                <li>GOOGLE_CLIENT_SECRET</li>
                                <li>NEXTAUTH_SECRET</li>
                                <li>NEXTAUTH_URL (optional, defaults to current URL)</li>
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/auth/signin"
                            className="px-6 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] transition-colors"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="px-6 py-2 rounded-lg border border-[hsl(var(--secondary))] text-[hsl(var(--text-main))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
                        >
                            Go Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default function AuthError() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex flex-col items-center justify-center bg-[hsl(var(--background))] text-[hsl(var(--text-main))]">
                <div className="text-center">
                    <div className="inline-block w-8 h-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-[hsl(var(--text-muted))]">Loading...</p>
                </div>
            </main>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
