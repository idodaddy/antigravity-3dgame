import React, { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

export default function AdBanner({ className, dataAdClient = "ca-pub-9323506568151323", dataAdSlot = "3359976647" }) {
    const adPushed = useRef(false);
    const location = useLocation();

    useEffect(() => {
        // Reset on route change if needed, but for now just safety check
        if (adPushed.current) return;

        try {
            // Check if adblocker is active by looking for the script or global object
            // But mainly just wrap the push safely
            if (typeof window !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                adPushed.current = true;
            }
        } catch (e) {
            console.error("AdSense error (likely AdBlock):", e);
        }
    }, [location.pathname]); // Re-run on route change if component persists

    return (
        <div className={`w-full h-32 rounded-2xl overflow-hidden relative group bg-gray-900/50 backdrop-blur-sm border border-white/5 ${className}`}>
            <div className="absolute top-0 left-0 bg-black/50 px-2 py-1 rounded-br-lg z-10">
                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">Sponsored</span>
            </div>

            <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: '100%' }}
                    data-ad-client={dataAdClient}
                    data-ad-slot={dataAdSlot}
                    data-ad-format="auto"
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    )
}
