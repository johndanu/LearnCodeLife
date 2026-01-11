"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HistorySidebar({ onSelectHistory, onRefresh, onNewAnalysis }) {
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
        <aside className="w-80 border-l border-[hsl(var(--secondary))] bg-[hsl(var(--surface))] flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-[hsl(var(--secondary))] flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[hsl(var(--text-main))]">History</h2>
                <button
                    onClick={onNewAnalysis}
                    className="px-3 py-1.5 text-xs rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] transition-colors"
                >
                    New
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-4 text-center text-[hsl(var(--text-muted))] text-sm">
                        Loading...
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-500 text-sm">
                        {error}
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-4 text-center text-[hsl(var(--text-muted))] text-sm">
                        No analysis history yet
                    </div>
                ) : (
                    <div className="p-2">
                        {history.map((item) => (
                            <button
                                key={item._id}
                                onClick={() => onSelectHistory(item)}
                                className="w-full p-3 mb-2 rounded-lg border border-[hsl(var(--secondary))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--surface-hover))] hover:border-[hsl(var(--primary))] transition-all text-left group"
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="text-sm font-medium text-[hsl(var(--text-main))] truncate flex-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                                        {item.title || "Untitled Analysis"}
                                    </h3>
                                </div>
                                {(item.language || item.framework) && (
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {item.language && (
                                            <span className="px-2 py-0.5 text-xs rounded bg-[hsl(var(--secondary))] text-[hsl(var(--text-muted))]">
                                                {item.language}
                                            </span>
                                        )}
                                        {item.framework && (
                                            <span className="px-2 py-0.5 text-xs rounded bg-[hsl(var(--secondary))] text-[hsl(var(--text-muted))]">
                                                {item.framework}
                                            </span>
                                        )}
                                    </div>
                                )}
                                <p className="text-xs text-[hsl(var(--text-muted))]">
                                    {formatDate(item.createdAt)}
                                </p>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
