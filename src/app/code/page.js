"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CodeInputSection from "../../components/CodeInputSection";
import Header from "../../components/Header";
import HistorySidebar from "../../components/HistorySidebar";

function CodePageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [refreshHistory, setRefreshHistory] = useState(null);
    const [resetCodeInput, setResetCodeInput] = useState(0);
    const [analysisIdFromUrl, setAnalysisIdFromUrl] = useState(null);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Close history on mobile when route changes
    useEffect(() => {
        setIsHistoryOpen(false);
    }, [pathname]);

    // Allow page to be accessed without authentication
    // Authentication will be required when user tries to generate a learning path

    // Extract ID from URL pathname
    useEffect(() => {
        const pathParts = pathname.split('/');
        const idFromUrl = pathParts[pathParts.length - 1];
        
        if (pathname.startsWith('/code/') && idFromUrl && idFromUrl !== 'code') {
            setAnalysisIdFromUrl(idFromUrl);
        } else {
            setAnalysisIdFromUrl(null);
            if (pathname === '/code') {
                setSelectedHistory(null);
            }
        }
    }, [pathname]);

    // Fetch and select analysis when ID is in URL
    useEffect(() => {
        const fetchAndSelectAnalysis = async () => {
            if (!analysisIdFromUrl) {
                setIsLoadingAnalysis(false);
                return;
            }
            
            // Wait for auth status to be determined (not loading)
            if (status === "loading") {
                setIsLoadingAnalysis(true);
                return;
            }
            
            setIsLoadingAnalysis(true);

            // If not authenticated, redirect to sign in
            if (status !== "authenticated") {
                router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/code/${analysisIdFromUrl}`)}`);
                setIsLoadingAnalysis(false);
                return;
            }

            try {
                const res = await fetch(`/api/code/${encodeURIComponent(analysisIdFromUrl)}`);
                
                if (!res.ok) {
                    if (res.status === 401) {
                        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(`/code/${analysisIdFromUrl}`)}`);
                        setIsLoadingAnalysis(false);
                        return;
                    }
                    if (res.status === 404) {
                        // Analysis not found, redirect to base /code
                        router.push('/code');
                        setIsLoadingAnalysis(false);
                        return;
                    }
                    const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
                    console.error("Failed to fetch analysis:", errorData.error);
                    setIsLoadingAnalysis(false);
                    return;
                }

                const data = await res.json();

                if (data.analysis) {
                    setSelectedHistory({
                        _id: data.analysis._id,
                        code: data.analysis.code,
                        learningPath: data.analysis.learningPath,
                        title: data.analysis.title,
                        language: data.analysis.language,
                        framework: data.analysis.framework
                    });
                }
                setIsLoadingAnalysis(false);
            } catch (err) {
                console.error("Error fetching analysis:", err);
                setIsLoadingAnalysis(false);
            }
        };

        fetchAndSelectAnalysis();
    }, [analysisIdFromUrl, status, router]);

    // Show loading only briefly, then show page regardless of auth status

    return (
        <div className="h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile History Toggle Button - Top Right */}
                {session && !isHistoryOpen && (
                    <button
                        onClick={() => setIsHistoryOpen(true)}
                        className="lg:hidden fixed top-20 right-4 z-40 rounded-lg bg-gradient-to-r from-primary to-primary-glow text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2 px-4 py-2"
                        aria-label="Show history"
                    >
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="text-sm font-semibold whitespace-nowrap">Show History</span>
                    </button>
                )}

                {/* Mobile Overlay */}
                {isHistoryOpen && session && (
                    <div
                        className="lg:hidden fixed top-16 inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm z-30"
                        onClick={() => setIsHistoryOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-hidden relative flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                        <div className="container relative z-10 h-full flex flex-col py-4 sm:py-6 px-4 sm:px-6">
                            {/* Code Input Section */}
                            <div className="w-full flex-1 flex flex-col min-h-0 animate-in" style={{ animationDelay: "0.2s" }}>
                                {isLoadingAnalysis && analysisIdFromUrl ? (
                                    <div className="flex flex-col items-center justify-center flex-1 py-12">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-text-muted text-sm">Loading analysis...</p>
                                    </div>
                                ) : (
                                    <CodeInputSection 
                                        key={`${resetCodeInput}-${selectedHistory?._id || 'new'}`}
                                        initialData={selectedHistory} 
                                        onAnalysisComplete={() => {
                                            // Trigger history refresh after analysis completes
                                            if (refreshHistory) {
                                                refreshHistory(true);
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Footer */}
                    <footer className="w-full border-t border-secondary/20 bg-surface/80 backdrop-blur-sm py-3 px-4 sm:px-6 text-center text-xs text-[hsl(var(--text-muted))] opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
                        <p>
                            Dev by johndanushan <span className="mx-2">•</span> Supported by lizris <span className="mx-2">•</span>
                            <a
                                href="https://github.com/johndanu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[hsl(var(--primary))] underline decoration-dashed underline-offset-4"
                            >
                                github/johndanu
                            </a>
                        </p>
                    </footer>
                </main>

                {/* History Sidebar - Only show if authenticated */}
                {session && (
                    <HistorySidebar 
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        onSelectHistory={async (item) => {
                            // Close sidebar on mobile when item is selected
                            setIsHistoryOpen(false);
                            // Fetch full analysis data when item is selected
                            const analysisId = item?._id || item?.id;
                            
                            if (!analysisId || typeof analysisId !== 'string') {
                                console.error("No valid analysis ID found in item:", item);
                                setSelectedHistory(null);
                                router.push('/code');
                                return;
                            }

                            try {
                                const res = await fetch(`/api/code/${encodeURIComponent(analysisId)}`);
                                
                                if (!res.ok) {
                                    const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
                                    console.error("Failed to fetch analysis:", errorData.error || `HTTP ${res.status}`);
                                    return;
                                }

                                const data = await res.json();

                                if (data.analysis) {
                                    // Update state with full analysis data
                                    setSelectedHistory({
                                        _id: data.analysis._id,
                                        code: data.analysis.code,
                                        learningPath: data.analysis.learningPath,
                                        title: data.analysis.title,
                                        language: data.analysis.language,
                                        framework: data.analysis.framework
                                    });
                                    
                                    // Update URL using Next.js router for proper routing
                                    router.push(`/code/${analysisId}`, { scroll: false });
                                } else {
                                    console.error("No analysis data in response:", data);
                                }
                            } catch (err) {
                                console.error("Error fetching analysis:", err);
                            }
                        }}
                        onRefresh={(refreshFn) => setRefreshHistory(() => refreshFn)}
                        onNewAnalysis={() => {
                            // Clear selected history
                            setSelectedHistory(null);
                            // Reset URL to base /code using Next.js router
                            router.push('/code');
                            // Mark that we're resetting
                            sessionStorage.setItem('codeInputReset', 'true');
                            // Force complete reset by changing key (remounts component)
                            setResetCodeInput(prev => prev + 1);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default CodePageContent;

