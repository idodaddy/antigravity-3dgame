import React from 'react'
import Button from './Button'

export default function GameCard({ title, id, color, link, image, compact = false }) {
    return (
        <div className={`group relative w-full ${compact ? 'aspect-square' : 'aspect-[16/9]'} rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:scale-105 hover:z-10 hover:shadow-[0_20px_40px_-15px_rgba(6,182,212,0.3)]`}>
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${image || ''})`, backgroundColor: '#1a1a1a' }}
            />

            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent ${compact ? 'opacity-90' : 'opacity-80 group-hover:opacity-90'} transition-opacity duration-500`} />

            {/* Content */}
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
                {/* Icon & Title */}
                <div className={`transform transition-all duration-500 ${compact ? 'translate-y-0' : 'group-hover:-translate-y-12'}`}>
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} mb-4 flex items-center justify-center shadow-lg`}>
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h3 className={`${compact ? 'text-lg' : 'text-2xl'} font-black text-white tracking-wide uppercase mb-1 leading-tight`}>
                        {title}
                    </h3>

                    {!compact && (
                        <div className="flex items-center gap-2">
                            <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Action</span>
                        </div>
                    )}
                </div>

                {/* Expanded Actions - Always visible/accessible on compact/mobile via full card link, but keeping button for consistency */}
                <div className={`absolute bottom-0 left-0 right-0 p-6 flex gap-3 ${compact ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0'} transition-all duration-500 delay-100`}>
                    <Button to={link} variant="primary" className="flex-1 py-2 text-sm">
                        Play
                    </Button>
                </div>
            </div>

            {/* Border Glow */}
            <div className="absolute inset-0 border-2 border-white/0 group-hover:border-cyan-500/50 rounded-2xl transition-colors duration-500 pointer-events-none" />
        </div>
    )
}
