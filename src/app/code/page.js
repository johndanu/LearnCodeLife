"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import CodeInputSection from "../../components/CodeInputSection";
import Header from "../../components/Header";
import HistorySidebar from "../../components/HistorySidebar";

export default function CodePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [refreshHistory, setRefreshHistory] = useState(null);
    const [resetCodeInput, setResetCodeInput] = useState(0);
    const [analysisIdFromUrl, setAnalysisIdFromUrl] = useState(null);

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
            if (!analysisIdFromUrl || status !== "authenticated") return;

            try {
                const res = await fetch(`/api/code/${analysisIdFromUrl}`);
                const data = await res.json();

                if (res.ok && data.analysis) {
                    setSelectedHistory({
                        code: data.analysis.code,
                        learningPath: data.analysis.learningPath,
                        title: data.analysis.title,
                        language: data.analysis.language,
                        framework: data.analysis.framework
                    });
                }
            } catch (err) {
                console.error("Error fetching analysis:", err);
            }
        };

        fetchAndSelectAnalysis();
    }, [analysisIdFromUrl, status]);

    // Show loading only briefly, then show page regardless of auth status

    return (
        <div className="h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden">
            <Header />

            <div className="flex flex-1 overflow-hidden">
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                    <div className="container relative z-10 min-h-full flex flex-col pb-10">
                        {/* Code Input Section */}
                        <div className="w-full mt-8 animate-in" style={{ animationDelay: "0.2s" }}>
                            <CodeInputSection 
                                key={resetCodeInput}
                                initialData={selectedHistory} 
                                onAnalysisComplete={() => {
                                    // Trigger history refresh after analysis completes
                                    if (refreshHistory) {
                                        refreshHistory(true);
                                    }
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <footer className="mt-auto text-center text-xs text-[hsl(var(--text-muted))] pt-6 opacity-60 hover:opacity-100 transition-opacity">
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
                    </div>
                </main>

                {/* History Sidebar - Only show if authenticated */}
                {session && (
                    <HistorySidebar 
                        onSelectHistory={(item) => {
                            // Update state with selected history item
                            setSelectedHistory(item);
                            
                            // Update URL without page reload using replace
                            if (item._id) {
                                // Use window.history to update URL without triggering navigation
                                window.history.pushState(null, '', `/code/${item._id}`);
                            } else {
                                // Reset to base /code if no ID
                                window.history.pushState(null, '', '/code');
                            }
                        }}
                        onRefresh={(refreshFn) => setRefreshHistory(() => refreshFn)}
                        onNewAnalysis={() => {
                            // Clear selected history
                            setSelectedHistory(null);
                            // Reset URL to base /code
                            window.history.pushState(null, '', '/code');
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

