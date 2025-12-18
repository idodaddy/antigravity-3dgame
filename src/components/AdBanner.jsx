import React, { useEffect } from 'react'

export default function AdBanner({ className, dataAdClient = "ca-pub-YOUR_PUBLISHER_ID", dataAdSlot = "1234567890" }) {
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense error:", e);
        }
    }, []);

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
