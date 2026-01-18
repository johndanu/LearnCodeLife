"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import CodeInputSection from "../../components/CodeInputSection";
import Header from "../../components/Header";
import HistorySidebar from "../../components/HistorySidebar";

function CodeClient({ children }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [isPending, startTransition] = useTransition();

    // The ID is now coming from the dynamic slug [[...slug]]
    const analysisIdFromUrl = params.slug && params.slug.length > 0 ? params.slug[0] : null;

    const [selectedHistory, setSelectedHistory] = useState(null);
    const [refreshHistory, setRefreshHistory] = useState(null);
    const [resetCodeInput, setResetCodeInput] = useState(0);
    const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Close history on mobile when route changes
    useEffect(() => {
        setIsHistoryOpen(false);
    }, [analysisIdFromUrl]);

    // Fetch and select analysis when ID is in URL
    useEffect(() => {
        const fetchAnalysis = async () => {
            if (!analysisIdFromUrl) {
                setSelectedHistory(null);
                setIsLoadingAnalysis(false);
                return;
            }

            // If we already have this history loaded, don't fetch again
            if (selectedHistory?._id === analysisIdFromUrl) {
                return;
            }

            if (status === "loading") return;

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
                    if (res.status === 404) {
                        router.push('/code');
                    }
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

        fetchAnalysis();
    }, [analysisIdFromUrl, status]);

    return (
        <div className="h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden relative">
                {/* Mobile History Toggle Button */}
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
                        className="lg:hidden fixed top-16 inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm z-[90]"
                        onClick={() => setIsHistoryOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 overflow-hidden relative flex flex-col h-full">
                    <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                        <div className="container relative h-full flex flex-col py-4 sm:py-6 px-4 sm:px-6">
                            <div className="w-full flex-1 flex flex-col min-h-0 animate-in" style={{ animationDelay: "0.2s" }}>
                                {isLoadingAnalysis && !selectedHistory ? (
                                    <div className="flex flex-col items-center justify-center flex-1 py-12">
                                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                                        <p className="text-text-muted text-sm">Loading analysis...</p>
                                    </div>
                                ) : (
                                    <div className={`w-full flex-1 flex flex-col ${isLoadingAnalysis ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-300`}>
                                        <CodeInputSection
                                            initialData={selectedHistory}
                                            onAnalysisComplete={() => {
                                                // Call registered silent refresh
                                                if (refreshHistory) refreshHistory();
                                            }}
                                        />
                                    </div>
                                )}
                                {children}
                            </div>
                        </div>
                    </div>

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

                {/* History Sidebar */}
                {session && (
                    <HistorySidebar
                        isOpen={isHistoryOpen}
                        onClose={() => setIsHistoryOpen(false)}
                        onSelectHistory={(item) => {
                            // Link handles navigation, we just handle the sidebar UI here
                            if (window.innerWidth < 1024) {
                                setIsHistoryOpen(false);
                            }
                        }}
                        onRefresh={(refreshFn) => setRefreshHistory(() => refreshFn)}
                        onNewAnalysis={() => {
                            setSelectedHistory(null);
                            router.push('/code');
                            sessionStorage.setItem('codeInputReset', 'true');
                            // Still need to force reset for NEW analysis button
                            setResetCodeInput(prev => prev + 1);
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default CodeClient;
