"use client";

import { useState, useEffect } from "react";

export default function TopicModal({ topic, onClose }) {
    const [explanation, setExplanation] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!topic) return;

        const fetchExplanation = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch('/api/explain', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ topic })
                });

                if (res.ok) {
                    const data = await res.json();
                    setExplanation(data.explanation || "No explanation available.");
                } else {
                    setError("Failed to fetch explanation. Please try again.");
                }
            } catch (err) {
                console.error("Error fetching explanation:", err);
                setError("Failed to fetch explanation. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchExplanation();
    }, [topic]);

    if (!topic) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div 
                className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--secondary))] shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-[hsl(var(--secondary))] flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-[hsl(var(--text-main))]">
                        {topic}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-[hsl(var(--surface-hover))] flex items-center justify-center text-[hsl(var(--text-muted))] hover:text-[hsl(var(--text-main))] transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
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
                        <div className="prose prose-invert max-w-none">
                            <p className="text-[hsl(var(--text-main))] leading-relaxed whitespace-pre-wrap">
                                {explanation}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[hsl(var(--secondary))] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
