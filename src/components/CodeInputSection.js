"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TopicModal from "./TopicModal";
import Toast from "./Toast";

export default function CodeInputSection({ initialData = null, onAnalysisComplete }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [code, setCode] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    // Initialize activeTab from localStorage if available, otherwise default to 0
    const [activeTab, setActiveTab] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTab = localStorage.getItem("learnCode_activeTab");
            return savedTab ? parseInt(savedTab, 10) : 0;
        }
        return 0;
    });
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedLevelName, setSelectedLevelName] = useState(null);
    const [analysisId, setAnalysisId] = useState(null);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const textareaRef = useRef(null);
    const hasResetRef = useRef(false);
    const previousActiveTabRef = useRef(0);

    const MAX_CHARS = 500;

    // Load from LocalStorage on mount or from initialData
    useEffect(() => {
        // Check if this is a fresh mount after reset (component remounted with new key)
        const wasReset = sessionStorage.getItem('codeInputReset') === 'true';
        if (wasReset) {
            // Clear everything for new analysis
            sessionStorage.removeItem('codeInputReset');
            setCode("");
            setAnalysisResult(null);
            setError(null);
            setActiveTab(0);
            localStorage.removeItem("learnCode_input");
            localStorage.removeItem("learnCode_result");
            localStorage.removeItem("learnCode_activeTab");
            setIsLoaded(true);
            hasResetRef.current = true;
            return;
        }

        if (initialData) {
            // Load from history
            setCode(initialData.code || "");
            setAnalysisId(initialData._id || null);
            const newAnalysisResult = { 
                result: initialData.learningPath,
                title: initialData.title,
                language: initialData.language,
                framework: initialData.framework
            };
            setAnalysisResult(newAnalysisResult);
            
            // Parse the learning path to check how many levels exist
            const lines = (initialData.learningPath || "").split('\n');
            let levelCount = 0;
            lines.forEach(line => {
                if (line.trim().toLowerCase().startsWith('level')) {
                    levelCount++;
                }
            });
            
            // Use saved tab from localStorage if valid, otherwise default to 0
            const savedTab = localStorage.getItem("learnCode_activeTab");
            const savedTabIndex = savedTab ? parseInt(savedTab, 10) : null;
            
            let tabToSet = 0;
            if (savedTabIndex !== null && savedTabIndex >= 0 && savedTabIndex < levelCount) {
                // Saved tab is valid for this analysis
                tabToSet = savedTabIndex;
            } else {
                // Default to 0 if no valid saved tab
                tabToSet = 0;
            }
            
            setActiveTab(tabToSet);
            previousActiveTabRef.current = tabToSet;
            
            setIsLoaded(true);
            hasResetRef.current = false;
        } else if (!hasResetRef.current) {
            // Load from localStorage only if not a reset
            const savedCode = localStorage.getItem("learnCode_input");
            const savedResult = localStorage.getItem("learnCode_result");
            const savedTab = localStorage.getItem("learnCode_activeTab");

            if (savedCode) setCode(savedCode);
            if (savedResult) {
                try {
                    const parsedResult = JSON.parse(savedResult);
                    setAnalysisResult(parsedResult);
                    
                    // Parse the learning path to check how many levels exist
                    const lines = (parsedResult?.result || "").split('\n');
                    let levelCount = 0;
                    lines.forEach(line => {
                        if (line.trim().toLowerCase().startsWith('level')) {
                            levelCount++;
                        }
                    });
                    
                    // Use saved tab if valid for this analysis
                    if (savedTab) {
                        const savedTabIndex = parseInt(savedTab, 10);
                        if (savedTabIndex >= 0 && savedTabIndex < levelCount) {
                            setActiveTab(savedTabIndex);
                        } else {
                            // Saved tab is invalid, default to 0
                            setActiveTab(0);
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse saved result", e);
                }
            } else if (savedTab) {
                // No saved result, but we have a saved tab preference - use it
                setActiveTab(parseInt(savedTab, 10));
            }
            setIsLoaded(true);
        } else {
            // Reset case - ensure everything is cleared
            setIsLoaded(true);
        }
    }, [initialData]);

    // Save to LocalStorage on change
    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("learnCode_input", code);
    }, [code, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        if (analysisResult) {
            localStorage.setItem("learnCode_result", JSON.stringify(analysisResult));
        } else {
            localStorage.removeItem("learnCode_result");
        }
    }, [analysisResult, isLoaded]);

    useEffect(() => {
        if (!isLoaded) return;
        localStorage.setItem("learnCode_activeTab", activeTab);
        previousActiveTabRef.current = activeTab;
    }, [activeTab, isLoaded]);


    const handleChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_CHARS) {
            setCode(value);
            if (error) setError(null);
        }
    };

    const handlePaste = (e) => {
        const pastedText = e.clipboardData.getData('text');
        const currentLength = code.length;
        const totalLength = currentLength + pastedText.length;

        if (totalLength > MAX_CHARS) {
            e.preventDefault();
            
            // Calculate how much can be pasted
            const allowedLength = MAX_CHARS - currentLength;
            
            if (allowedLength > 0) {
                // Paste only what fits
                const truncatedText = pastedText.substring(0, allowedLength);
                setCode(code + truncatedText);
                // Show toast about truncation
                const removedChars = pastedText.length - truncatedText.length;
                setToastMessage(`Pasted text was truncated (${removedChars} characters removed to fit ${MAX_CHARS} limit)`);
                setShowToast(true);
            } else {
                // No room at all
                setToastMessage(`Cannot paste more than ${MAX_CHARS} characters`);
                setShowToast(true);
            }
        }
    };

    const handleAnalyze = async () => {
        if (!code.trim()) return;

        // Check authentication status
        if (status === "unauthenticated" || !session) {
            // Redirect to sign-in with callback URL
            router.push("/auth/signin?callbackUrl=/code");
            return;
        }

        // Wait for session to be ready if still loading
        if (status === "loading") {
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResult(null);
        setError(null);
        // Don't reset activeTab here - will be set after analysis based on saved preference

        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });

            // Check if response is JSON
            const contentType = res.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                // Response is not JSON, likely an HTML error page
                const text = await res.text();
                console.error('Non-JSON response received:', text.substring(0, 200));
                
                if (res.status === 401) {
                    // Redirect to sign-in if authentication is required
                    router.push("/auth/signin?callbackUrl=/code");
                    return;
                } else if (res.status === 404) {
                    setError("API endpoint not found. Please check your configuration.");
                } else {
                    setError(`Server error (${res.status}). Please try again later.`);
                }
                return;
            }

            const data = await res.json();
            if (res.ok) {
                 // Transform response to match expected format
                 setAnalysisResult({ 
                     result: data.learningPath,
                     title: data.title,
                     language: data.language,
                     framework: data.framework
                 });
                 // Store analysis ID if provided
                 if (data.id) {
                     setAnalysisId(data.id);
                 }
                 
                 // Parse the learning path to check how many levels exist
                 const lines = (data.learningPath || "").split('\n');
                 let levelCount = 0;
                 lines.forEach(line => {
                     if (line.trim().toLowerCase().startsWith('level')) {
                         levelCount++;
                     }
                 });
                 
                 // Use saved tab from localStorage if valid, otherwise default to 0
                 const savedTab = localStorage.getItem("learnCode_activeTab");
                 const savedTabIndex = savedTab ? parseInt(savedTab, 10) : null;
                 const tabToSet = (savedTabIndex !== null && savedTabIndex >= 0 && savedTabIndex < levelCount) 
                     ? savedTabIndex 
                     : 0;
                 setActiveTab(tabToSet);
                 
                 // Trigger history refresh after successful analysis
                 if (onAnalysisComplete) {
                     // Small delay to ensure DB save is complete
                     setTimeout(() => {
                         onAnalysisComplete();
                     }, 500);
                 }
            } else {
                // Handle 401 specifically by redirecting to sign-in
                if (res.status === 401) {
                    router.push("/auth/signin?callbackUrl=/code");
                    return;
                }
                setError(data.error || "Analysis failed. Please try again.");
            }
        } catch (err) {
            console.error("Request error:", err);
            if (err instanceof SyntaxError) {
                setError("Invalid response from server. Please try again.");
            } else {
                setError("Network error. Please check your connection.");
            }
        } finally {
            setIsAnalyzing(false);
        }
    };

    const parsedResults = useMemo(() => {
        if (!analysisResult?.result) return [];

        const lines = analysisResult.result.split('\n');
        const sections = [];
        let currentSection = null;

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.toLowerCase().startsWith('level')) {
                if (currentSection) sections.push(currentSection);
                currentSection = { title: line, items: [] };
            }
            else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                if (!currentSection) {
                    currentSection = { title: "Foundations", items: [] };
                }
                currentSection.items.push(line.replace(/^[-•*]\s*/, ''));
            }
        });
        if (currentSection) sections.push(currentSection);

        return sections;
    }, [analysisResult]);

    if (!isLoaded) return null; // Avoid hydration mismatch

    const hasResults = parsedResults.length > 0;

    return (
        <div className={`w-full ${hasResults ? 'max-w-7xl' : 'max-w-3xl'} mx-auto flex flex-col gap-6 h-full transition-all duration-700 ease-in-out`}>

          

            {/* Conditional Layout: Split when results exist, centered when not */}
            {!hasResults ? (
                /* Centered Layout - Input Only */
                <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="relative w-full rounded-xl bg-[#1e1e1e] border border-[hsl(var(--secondary))] shadow-inner overflow-hidden group animate-in fade-in zoom-in-95 duration-500">
                        {/* Fake Window Controls for extra editor feel */}
                        <div className="flex gap-1.5 p-3 px-4 border-b border-white/10 bg-[#252526]">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-60"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-60"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-60"></div>
                            <div className="ml-auto text-[10px] text-white/30 font-mono">input.js</div>
                        </div>

                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={handleChange}
                            onPaste={handlePaste}
                            placeholder="// Paste your code here..."
                            className="w-full h-56 p-4 bg-[#1e1e1e] resize-none font-mono text-sm leading-relaxed text-[#d4d4d4] placeholder:text-white/20 focus:outline-none"
                            spellCheck="false"
                        />
                        <div className="absolute bottom-2 right-4 text-[10px] font-mono text-white/30">
                            {code.length}/{MAX_CHARS} chars
                        </div>
                    </div>

                    {/* Error Box */}
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Analyze Button */}
                    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: '200ms' }}>
                        <button
                            onClick={handleAnalyze}
                            disabled={!code.trim() || isAnalyzing}
                            className={`
                                px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                ${!code.trim() || isAnalyzing
                                    ? 'bg-[hsl(var(--secondary))] text-[hsl(var(--text-muted))] cursor-not-allowed'
                                    : 'bg-[hsl(var(--primary))] text-white hover:bg-[hsl(var(--primary-glow))] hover:shadow-lg active:scale-95'
                                }
                            `}
                        >
                            {isAnalyzing ? "Analyzing..." : "What should I learn to understand this?"}
                        </button>
                    </div>
                </div>
            ) : (
                /* Split Layout - Code Left, Path Center Right */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* Left: Code Section */}
                    <div className="flex flex-col gap-4 h-full animate-in fade-in slide-in-from-left duration-700">
                           
                        <div className="relative w-full flex-1 rounded-xl bg-[#1e1e1e] border border-[hsl(var(--secondary))] shadow-inner overflow-hidden group min-h-[300px]">
                            {/* Fake Window Controls */}
                            <div className="flex gap-1.5 p-3 px-4 border-b border-white/10 bg-[#252526]">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-60"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-60"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-60"></div>
                                <div className="ml-auto text-[10px] text-white/30 font-mono">{analysisResult?.title || "Your Code Analysis"}  {analysisResult?.title && (analysisResult?.language || analysisResult?.framework) ? " | " : ""}
                                {analysisResult?.language || ""} {analysisResult?.language && analysisResult?.framework ? " | " : ""}
                                {analysisResult?.framework || ""}</div>
                            </div>

                            <textarea
                                ref={textareaRef}
                                value={code}
                                onChange={handleChange}
                                onPaste={handlePaste}
                                placeholder="// Paste your code here..."
                                className="w-full h-full p-4 bg-[#1e1e1e] resize-none font-mono text-sm leading-relaxed text-[#d4d4d4] placeholder:text-white/20 focus:outline-none overflow-y-auto"
                                spellCheck="false"
                            />
                            <div className="absolute bottom-2 right-4 text-[10px] font-mono text-white/30">
                                {code.length}/{MAX_CHARS} chars
                            </div>
                        </div>

                        {/* Error Box */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right: Learning Path Section */}
                    <div className="flex flex-col gap-4 h-full animate-in fade-in slide-in-from-right duration-700">
                        <div className="border-t border-[hsl(var(--secondary))] pt-6 flex flex-col h-full">
                                <h2 className="text-xl text-center font-semibold text-[hsl(var(--text-main))] mb-4">
                                    Your Learning Path
                                </h2>
                            {/* Tab Navigation */}
                            <div className="flex flex-wrap justify-center gap-2 mb-6 flex-shrink-0">
                                {parsedResults.map((section, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveTab(idx)}
                                        className={`
                                            px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-full transition-all duration-300
                                            ${activeTab === idx
                                                ? 'bg-[hsl(var(--primary))] text-white shadow-md'
                                                : 'bg-[hsl(var(--surface))] text-[hsl(var(--text-muted))] border border-[hsl(var(--secondary))] hover:bg-[hsl(var(--text-muted))/0.1]'
                                            }
                                        `}
                                    >
                                        Level {idx + 1}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="flex-1 overflow-y-auto min-h-0">
                                {parsedResults[activeTab] && (
                                    <div className="bg-[hsl(var(--surface))] rounded-xl border border-[hsl(var(--secondary))] p-6 sm:p-8 shadow-sm animate-in fade-in zoom-in-95 duration-300 h-full">
                                        <h3 className="text-base font-semibold text-[hsl(var(--text-main))] mb-6 border-b border-[hsl(var(--secondary))] pb-4">
                                            {parsedResults[activeTab].title}
                                        </h3>
                                        <ul className="space-y-4">
                                            {parsedResults[activeTab].items.map((item, i) => (
                                                <li key={i} className="flex items-start gap-3 text-[hsl(var(--text-main))] text-sm leading-relaxed group">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[hsl(var(--primary))] flex-shrink-0 group-hover:scale-125 transition-transform" />
                                                    <button
                                                        onClick={() => {
                                                            setSelectedTopic(item);
                                                            setSelectedLevelName(parsedResults[activeTab].title);
                                                        }}
                                                        className="text-left hover:text-[hsl(var(--primary))] transition-colors cursor-pointer underline decoration-dashed decoration-transparent hover:decoration-[hsl(var(--primary))] underline-offset-2"
                                                    >
                                                        {item}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={() => {
                                    setAnalysisResult(null);
                                    localStorage.removeItem("learnCode_result");
                                    setActiveTab(0);
                                }}
                                className="text-xs text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))] transition-colors"
                            >
                                Clear Results
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Topic Explanation Modal */}
            {selectedTopic && (
                <TopicModal
                    topic={selectedTopic}
                    levelName={selectedLevelName}
                    analysisId={analysisId}
                    language={analysisResult?.language || null}
                    framework={analysisResult?.framework || null}
                    onClose={() => {
                        setSelectedTopic(null);
                        setSelectedLevelName(null);
                    }}
                />
            )}

            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
                type="error"
            />
        </div>
    );
}
