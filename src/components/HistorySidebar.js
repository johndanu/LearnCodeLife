"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function HistorySidebar({ onSelectHistory, onRefresh, onNewAnalysis, isOpen = true, onClose }) {
    const { data: session } = useSession();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedLabel, setSelectedLabel] = useState(null);
    const [editingItem, setEditingItem] = useState(null); // ID of item being edited
    const [newLabelInput, setNewLabelInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [allLabels, setAllLabels] = useState([]); // Store all available labels

    // Fetch history from API
    const fetchHistory = async (silent = false, search = "", label = null) => {
        if (!session) {
            setLoading(false);
            return;
        }

        try {
            if (!silent) setLoading(true);

            // Build URL with params
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (label) params.append('label', label);

            const res = await fetch(`/api/code?${params.toString()}`);
            const data = await res.json();

            if (res.ok && data.analyses) {
                setHistory(data.analyses);

                // Update allLabels if we're not currently filtering (to keep the list complete)
                // or merge with existing labels
                if (!search && !label) {
                    const uniqueLabels = [...new Set(data.analyses.flatMap(item => item.labels || []))].sort();
                    setAllLabels(uniqueLabels);
                } else {
                    // Just in case there are labels in the filtered results not in our master list
                    const newLabels = data.analyses.flatMap(item => item.labels || []);
                    setAllLabels(prev => [...new Set([...prev, ...newLabels])].sort());
                }

                setError(null);
            } else {
                setError("Failed to load history");
            }
        } catch (err) {
            console.error("Error fetching history:", err);
            setError("Failed to load history");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Debounced search and label filtering
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistory(true, searchQuery, selectedLabel);
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [searchQuery, selectedLabel, session]);

    // Click outside to close label manager
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (editingItem && !e.target.closest('.label-manager')) {
                setEditingItem(null);
                setNewLabelInput("");
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [editingItem]);

    // Label management handlers
    const handleAddLabel = async (itemId, labels, specificLabel = null) => {
        const labelToAdd = (specificLabel || newLabelInput).trim();
        if (!labelToAdd) return;

        const updatedLabels = [...new Set([...labels, labelToAdd])];

        try {
            const res = await fetch(`/api/code/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: updatedLabels })
            });

            if (res.ok) {
                setHistory(prev => prev.map(item =>
                    item._id === itemId ? { ...item, labels: updatedLabels } : item
                ));
                // Also update our master label list
                setAllLabels(prev => [...new Set([...prev, labelToAdd])].sort());
                setNewLabelInput("");
            }
        } catch (err) {
            console.error("Error adding label:", err);
        }
    };

    const handleRemoveLabel = async (itemId, labels, labelToRemove) => {
        const updatedLabels = labels.filter(l => l !== labelToRemove);

        try {
            const res = await fetch(`/api/code/${itemId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ labels: updatedLabels })
            });

            if (res.ok) {
                setHistory(prev => prev.map(item =>
                    item._id === itemId ? { ...item, labels: updatedLabels } : item
                ));
            }
        } catch (err) {
            console.error("Error removing label:", err);
        }
    };

    // Initial fetch - the useEffect above handles it but we might want a clean starting fetch
    useEffect(() => {
        if (session) fetchHistory();
        if (onRefresh) {
            onRefresh(() => fetchHistory(true, searchQuery, selectedLabel));
        }
    }, [session]);

    // History is now already filtered by the server
    const filteredHistory = history;

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
            <div className="p-4 border-b border-secondary/20 bg-surface/80 backdrop-blur-sm flex flex-col gap-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
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

                {/* Search Bar */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search analyses..."
                        className="w-full bg-secondary/10 border border-secondary/20 rounded-lg py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                    <svg className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Filter Labels */}
                {allLabels.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-hide py-1">
                        <button
                            onClick={() => setSelectedLabel(null)}
                            className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-all duration-200 ${!selectedLabel ? 'bg-primary border-primary text-white shadow-sm shadow-primary/25' : 'bg-surface/50 border-secondary/30 text-text-muted hover:border-primary/50 hover:bg-secondary/10'}`}
                        >
                            All
                        </button>
                        {allLabels.map(label => (
                            <button
                                key={label}
                                onClick={() => setSelectedLabel(selectedLabel === label ? null : label)}
                                className={`px-2.5 py-1 text-[10px] font-medium rounded-full border transition-all duration-200 ${selectedLabel === label ? 'bg-primary border-primary text-white shadow-sm shadow-primary/25' : 'bg-surface/50 border-secondary/30 text-text-muted hover:border-primary/50 hover:bg-secondary/10'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
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
                ) : filteredHistory.length === 0 ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-text-muted text-sm">{selectedLabel ? "No matches for this label" : "No analysis history yet"}</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-3">
                        {filteredHistory.map((item) => (
                            <div key={item._id} className="relative group/item">
                                <Link
                                    href={`/code/${item._id}`}
                                    onClick={(e) => {
                                        // If we are clicking inside label management, don't navigate
                                        if (e.target.closest('.label-manager')) return;
                                        if (window.innerWidth < 1024) {
                                            onClose();
                                        }
                                        onSelectHistory(item);
                                    }}
                                    className="block w-full p-3 rounded-xl border border-secondary/20 bg-surface/60 hover:bg-surface-hover hover:border-primary/50 transition-all duration-200 text-left active:scale-[0.98] shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h3 className="text-sm font-semibold text-text-main leading-tight truncate flex-1 group-hover/item:text-primary transition-colors">
                                            {item.title || "Untitled Analysis"}
                                        </h3>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setEditingItem(editingItem === item._id ? null : item._id);
                                            }}
                                            className="opacity-0 group-hover/item:opacity-100 p-1 rounded-md hover:bg-secondary/30 text-text-muted transition-all"
                                            title="Manage Tags"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Display Labels */}
                                    {(item.labels && item.labels.length > 0) && (
                                        <div className="flex flex-wrap gap-1 mb-2">
                                            {item.labels.map(label => (
                                                <span key={label} className="px-1.5 py-0.5 text-[9px] font-semibold bg-primary/10 text-primary border border-primary/20 rounded">
                                                    {label}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-2 flex-wrap items-center">
                                        <p className="text-[10px] text-text-muted/70 flex items-center gap-1">
                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {formatDate(item.createdAt)}
                                        </p>
                                        {(item.language || item.framework) && (
                                            <>
                                                {item.language && (
                                                    <span className="px-1 py-0.5 text-[9px] font-medium rounded bg-secondary/40 text-text-muted border border-secondary/20">
                                                        {item.language}
                                                    </span>
                                                )}
                                                {item.framework && (
                                                    <span className="px-1 py-0.5 text-[9px] font-medium rounded bg-secondary/30 text-text-muted border border-secondary/20">
                                                        {item.framework}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </Link>

                                {/* Label Manager Overlay */}
                                {editingItem === item._id && (
                                    <div className="label-manager absolute -bottom-2 translate-y-full left-0 right-0 z-20 p-2 mt-1 bg-surface border border-secondary/30 rounded-lg shadow-2xl animate-in fade-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={newLabelInput}
                                                onChange={(e) => setNewLabelInput(e.target.value)}
                                                placeholder="Add tag..."
                                                className="flex-1 bg-secondary/10 border border-secondary/20 rounded px-2 py-1 text-xs focus:outline-none focus:border-primary"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleAddLabel(item._id, item.labels || []);
                                                }}
                                            />
                                            <button
                                                onClick={() => handleAddLabel(item._id, item.labels || [])}
                                                className="p-1 bg-primary text-white rounded hover:bg-primary-glow"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Suggestions */}
                                        {newLabelInput.trim() && (
                                            <div className="mb-2 max-h-24 overflow-y-auto border-b border-secondary/10 pb-2">
                                                {allLabels
                                                    .filter(l =>
                                                        l.toLowerCase().includes(newLabelInput.toLowerCase()) &&
                                                        !(item.labels || []).includes(l)
                                                    )
                                                    .slice(0, 5)
                                                    .map(suggestion => (
                                                        <button
                                                            key={suggestion}
                                                            onClick={() => {
                                                                handleAddLabel(item._id, item.labels || [], suggestion);
                                                            }}
                                                            className="block w-full text-left px-2 py-1 text-[10px] text-text-muted hover:bg-secondary/10 hover:text-primary rounded transition-colors"
                                                        >
                                                            + {suggestion}
                                                        </button>
                                                    ))
                                                }
                                            </div>
                                        )}

                                        <div className="flex flex-wrap gap-1">
                                            {(item.labels || []).map(label => (
                                                <span key={label} className="group/tag flex items-center gap-1 px-1.5 py-0.5 text-[10px] bg-secondary/20 rounded-md">
                                                    {label}
                                                    <button
                                                        onClick={() => handleRemoveLabel(item._id, item.labels || [], label)}
                                                        className="text-text-muted hover:text-red-400"
                                                    >
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </span>
                                            ))}
                                            <button
                                                onClick={() => setEditingItem(null)}
                                                className="ml-auto text-[10px] text-primary hover:underline"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
