"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function Header() {
    const { data: session, status } = useSession();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        }

        if (isDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <header className="w-full border-b border-secondary/20 bg-surface/80 backdrop-blur-md sticky top-0 z-50 supports-[backdrop-filter]:bg-surface/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
                <Link 
                    href="/" 
                    className="text-xl sm:text-2xl font-serif font-semibold text-text-main hover:text-primary transition-colors duration-200 group"
                >
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        LearnCode
                    </span>
                    <span className="text-text-muted group-hover:text-primary transition-colors">.Life</span>
                </Link>

                <nav className="flex items-center gap-4 sm:gap-6">
                    {status === "loading" ? (
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-secondary/50 animate-pulse" />
                    ) : session ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-primary/50 hover:border-primary-glow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-surface active:scale-95"
                                aria-label="User menu"
                            >
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-full h-full rounded-full object-cover ring-2 ring-primary/20"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                                        {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-12 mt-2 w-64 rounded-xl bg-surface border border-secondary/30 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top backdrop-blur-sm">
                                    <div className="p-4 border-b border-secondary/20 bg-surface-hover/50">
                                        {session.user?.name && (
                                            <p className="text-sm font-semibold text-text-main truncate">
                                                {session.user.name}
                                            </p>
                                        )}
                                        {session.user?.email && (
                                            <p className="text-xs text-text-muted truncate mt-1">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-text-main hover:bg-surface-hover transition-colors duration-150 flex items-center gap-2 group"
                                    >
                                        <svg className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("google")}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-glow hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                        >
                            Sign In
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
