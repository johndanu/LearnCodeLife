"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
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
        <header className="w-full border-b border-[hsl(var(--secondary))] bg-[hsl(var(--surface))]/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 text-xl font-serif font-medium text-[hsl(var(--text-main))] hover:text-[hsl(var(--primary))] transition-colors">
                    <Image 
                        src="/logo.png" 
                        alt="LearnCode.Life Logo" 
                        width={32} 
                        height={32} 
                        className="rounded"
                    />
                    <span>LearnCode.Life</span>
                </Link>

                <nav className="flex items-center gap-6">
                    {status === "loading" ? (
                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--secondary))] animate-pulse" />
                    ) : session ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-[hsl(var(--primary))] hover:border-[hsl(var(--primary-glow))] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] focus:ring-offset-2"
                            >
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-white font-medium">
                                        {session.user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </div>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute right-0 top-12 mt-2 w-64 rounded-lg bg-[hsl(var(--surface))] border border-[hsl(var(--secondary))] shadow-lg overflow-hidden z-50">
                                    <div className="p-4 border-b border-[hsl(var(--secondary))]">
                                        {session.user?.name && (
                                            <p className="text-sm font-medium text-[hsl(var(--text-main))] truncate">
                                                {session.user.name}
                                            </p>
                                        )}
                                        {session.user?.email && (
                                            <p className="text-xs text-[hsl(var(--text-muted))] truncate mt-1">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            signOut();
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full px-4 py-3 text-left text-sm text-[hsl(var(--text-main))] hover:bg-[hsl(var(--surface-hover))] transition-colors"
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => signIn("google")}
                            className="px-4 py-2 text-sm rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] hover:shadow-lg transition-all duration-200"
                        >
                            Sign In
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
}
