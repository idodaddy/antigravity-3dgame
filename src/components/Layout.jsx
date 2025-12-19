import React from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

export default function Layout({ children }) {
    return (
        <div className="min-h-screen text-white font-sans selection:bg-cyan-500 selection:text-black flex flex-col">
            {/* Background Elements */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px]" />
            </div>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="group flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-purple-600 flex items-center justify-center text-black font-black text-lg transform group-hover:rotate-12 transition-transform">
                            P
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors">
                            play<span className="text-gray-500 group-hover:text-white transition-colors">mini</span>
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-4">
                        <Button to="/" variant="ghost" className="text-sm">Games</Button>
                        <Button variant="ghost" className="text-sm opacity-50 cursor-not-allowed">Leaderboards</Button>
                        <Button variant="ghost" className="text-sm opacity-50 cursor-not-allowed">Community</Button>
                        <Button variant="secondary" className="px-6 py-2 text-sm rounded-full">Sign In</Button>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-white/5 bg-black/20 backdrop-blur-sm py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-gray-500 text-sm">
                        &copy; 2025 PlayMini. Crafted for gamers.
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" className="text-xs px-4 py-2">Privacy</Button>
                        <Button variant="ghost" className="text-xs px-4 py-2">Terms</Button>
                        <Button variant="ghost" className="text-xs px-4 py-2">Contact</Button>
                    </div>
                </div>
            </footer>
        </div>
    )
}
