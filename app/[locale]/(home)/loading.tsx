
import React from 'react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center z-50">
            <div className="relative w-16 h-16 mb-8">
                <div className="absolute inset-0 border-t-2 border-teal-500 rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-r-2 border-zinc-700 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 animate-pulse">
                Initializing Qunt Edge
            </div>
        </div>
    );
}
