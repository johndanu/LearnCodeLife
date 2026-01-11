"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HistorySidebar({ onSelectHistory, onRefresh, onNewAnalysis, isOpen = true, onClose }) {
    const { data: session } = useSession();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch history from API
    const fetchHistory = async () => {
        if (!session) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/code');
            const data = await res.json();

            if (res.ok && data.analyses) {
                setHistory(data.analyses);
                setError(null);
            } else {
                setError("Failed to load history");
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            setError("Failed to load history");
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and register refresh function
    useEffect(() => {
        fetchHistory();
        if (onRefresh) {
            onRefresh(fetchHistory);
        }
    }, [session]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "Unknown date";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <aside className={`
            fixed lg:static
            top-16 lg:top-0
            right-0
            w-full max-w-sm lg:w-80
            h-[calc(100vh-4rem)] lg:h-full
            border-l border-secondary/20 
            bg-surface/95 lg:bg-surface/50 
            backdrop-blur-md lg:backdrop-blur-sm 
            flex flex-col 
            overflow-hidden
            z-40 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
            shadow-xl lg:shadow-none
        `}>
            {/* Header */}
            <div className="p-4 border-b border-secondary/20 bg-surface/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
                <h2 className="text-lg font-bold text-text-main">History</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onNewAnalysis}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white hover:shadow-lg hover:shadow-primary/25 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        + New
                    </button>
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-1.5 rounded-lg hover:bg-surface-hover transition-colors"
                        aria-label="Close history"
                    >
                        <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary/30 scrollbar-track-transparent">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-text-muted text-sm">Loading...</p>
                    </div>
                ) : error ? (
                    <div className="p-4 m-4 rounded-lg bg-red-50/50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm text-center">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-text-muted text-sm">No analysis history yet</p>
                        <p className="text-text-muted/70 text-xs mt-1">Start analyzing code to see your history</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-2">
                        {history.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => onSelectHistory(item)}
                                className="w-full p-2 rounded-xl border border-secondary/20 bg-surface/60 hover:bg-surface-hover hover:border-primary/50 transition-all duration-200 text-left group active:scale-[0.98] shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-semibold text-text-main truncate flex-1 group-hover:text-primary transition-colors">
                                        {item.title || "Untitled Analysis"}
                                    </h3>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                <p className="text-xs text-text-muted/70 flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatDate(item.createdAt)}
                                </p>
                                {(item.language || item.framework) && (
                                        <>
                                        {item.language && (
                                            <span className="px-1 py-1 text-xs font-medium rounded-md bg-secondary/40 text-text-muted border border-secondary/20">
                                                {item.language}
                                            </span>
                                        )}
                                        {item.framework && (
                                            <span className="px-1 py-1 text-xs font-medium rounded-md bg-secondary/30 text-text-muted border border-secondary/20">
                                                {item.framework}
                                            </span>
                                        )}
                                        </>
                                )}
                               
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
