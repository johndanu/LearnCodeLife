"use client";

import { useState, useEffect } from "react";

export default function TopicModal({ topic, levelName, analysisId, language, framework, onClose }) {
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Build search query: topic + (framework if available, otherwise language)
    const buildSearchQuery = () => {
        const searchTerm = framework ? `${topic} ${framework}` : language ? `${topic} ${language}` : topic;
        return encodeURIComponent(searchTerm);
    };

    const handleGoogleSearch = () => {
        const query = buildSearchQuery();
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
    };

    const handleYouTubeSearch = () => {
        const query = buildSearchQuery();
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
    };

    useEffect(() => {
        if (!topic) return;

        const fetchExplanation = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic,
                        levelName: levelName || null,
                        analysisId: analysisId || null
                    })
                });

                const data = await res.json();

                if (res.ok) {
                    setExplanation(data.explanation || "No explanation available.");
                } else {
                    // Show more specific error message
                    const errorMsg = data.error || `Failed to fetch explanation (${res.status})`;
                    setError(errorMsg);
                    // Still set explanation if available (fallback from API)
                    if (data.explanation) {
                        setExplanation(data.explanation);
                    }
                }
            } catch (err) {
                console.error("Error fetching explanation:", err);
                setError("Network error. Please check your connection and try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchExplanation();
    }, [topic, levelName, analysisId]);

    // Simplified markdown-lite formatter to handle code blocks and inline code
    const formatExplanation = (text) => {
        if (!text) return null;

        // Split by code blocks (```language ... ```)
        const parts = text.split(/(```[\s\S]*?```)/g);

        return parts.map((part, index) => {
            if (part.startsWith('```')) {
                // Code Block
                const match = part.match(/```(\w+)?\n?([\s\S]*?)```/);
                const language = match ? match[1] : '';
                const code = match ? match[2].trim() : part.slice(3, -3).trim();

                return (
                    <div key={index} className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1e1e1e] shadow-inner group/code relative">
                        {language && (
                            <div className="bg-[#252526] px-4 py-1.5 border-b border-white/10 flex justify-between items-center">
                                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 font-mono italic">{language}</span>
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 rounded-full bg-white/5"></div>
                                    <div className="w-2 h-2 rounded-full bg-white/5"></div>
                                </div>
                            </div>
                        )}
                        {!language && (
                            <div className="bg-[#252526] px-4 py-1 border-b border-white/10 flex justify-end">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white/5"></div>
                                </div>
                            </div>
                        )}
                        <pre className="p-4 overflow-x-auto font-mono text-sm leading-relaxed text-[#d4d4d4] scrollbar-thin scrollbar-thumb-white/10">
                            <code>{code}</code>
                        </pre>
                    </div>
                );
            } else {
                // Regular text + inline code
                const textParts = part.split(/(`[^`]+`)/g);
                return (
                    <span key={index}>
                        {textParts.map((tPart, tIndex) => {
                            if (tPart.startsWith('`') && tPart.endsWith('`')) {
                                return (
                                    <code key={tIndex} className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[hsl(var(--secondary))/0.3] border border-[hsl(var(--secondary))/0.5] text-[hsl(var(--primary))] font-mono text-[0.9em] font-medium">
                                        {tPart.slice(1, -1)}
                                    </code>
                                );
                            }
                            return tPart;
                        })}
                    </span>
                );
            }
        });
    };

    if (!topic) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--secondary))] shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="p-6 border-b border-[hsl(var(--secondary))] flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-semibold text-[hsl(var(--text-main))]">
                        {topic}
                    </h2>
                    <div className="flex items-center gap-2">
                        {/* Search Icons */}
                        <button
                            onClick={handleGoogleSearch}
                            className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--surface-hover))] flex items-center justify-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))] transition-colors"
                            title="Search on Google"
                            aria-label="Search on Google"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                        </button>
                        <button
                            onClick={handleYouTubeSearch}
                            className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--surface-hover))] flex items-center justify-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))] transition-colors"
                            title="Search on YouTube"
                            aria-label="Search on YouTube"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            </svg>
                        </button>
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--surface-hover))] flex items-center justify-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))] transition-colors"
                            title="Close"
                            aria-label="Close"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                    {loading ? (
                        <div className="text-center text-[hsl(var(--text-muted))] py-8">
                            <div className="inline-block w-8 h-8 border-4 border-[hsl(var(--primary))] border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p>Loading explanation...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-8">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div className="text-[hsl(var(--text-main))] text-[15px] leading-[1.7] whitespace-pre-wrap">
                            {formatExplanation(explanation)}
                        </div>
                    )}
                </div>

                {/* Footer - Fixed */}
                <div className="p-6 border-t border-[hsl(var(--secondary))] flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] transition-colors shadow-sm active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
