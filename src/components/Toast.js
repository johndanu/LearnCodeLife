"use client";

import { useEffect } from "react";

export default function Toast({ message, isVisible, onClose, type = "info" }) {
    useEffect(() => {
        if (isVisible && message) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // Auto-close after 5 seconds

            return () => clearTimeout(timer);
        }
    }, [isVisible, message, onClose]);

    if (!isVisible || !message) return null;

    const bgColor = type === "error" 
        ? "bg-red-50 border-red-200 text-red-600" 
        : type === "success"
        ? "bg-green-50 border-green-200 text-green-600"
        : "bg-blue-50 border-blue-200 text-blue-600";

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
            <div className={`${bgColor} border rounded-lg shadow-lg p-4 max-w-md flex items-center justify-between gap-4`}>
                <p className="text-sm flex-1">{message}</p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 w-5 h-5 rounded hover:bg-black/10 flex items-center justify-center transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
