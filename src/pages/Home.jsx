import React from 'react'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import AdBanner from '../components/AdBanner'
import Button from '../components/Button'

export default function Home() {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="relative w-full h-[600px] rounded-3xl overflow-hidden mb-20 group border border-white/10 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent z-10" />
                {/* Animated Background Placeholder */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-60" />

                <div className="relative z-20 h-full flex flex-col justify-center px-12 max-w-5xl">
                    <span className="inline-block px-4 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 text-sm font-bold tracking-wider uppercase mb-6 w-fit animate-fade-in backdrop-blur-md">
                        Featured Game
                    </span>
                    <h1 className="text-7xl md:text-8xl font-black text-white mb-6 leading-none animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
                        NEON <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 text-glow">RUNNER</span>
                    </h1>
                    <p className="text-2xl text-gray-300 mb-10 max-w-2xl animate-fade-in font-light leading-relaxed" style={{ animationDelay: '0.2s' }}>
                        Experience the ultimate high-speed infinite runner. Dodge obstacles, collect minerals, and survive the digital void.
                    </p>
                    <div className="flex gap-6 animate-fade-in" style={{ animationDelay: '0.3s' }}>
                        <Button to="/game/neon-runner" variant="primary" className="px-10 py-5 text-xl tracking-wide">
                            PLAY NOW
                        </Button>
                        <Button variant="secondary" className="px-10 py-5 text-xl tracking-wide">
                            WATCH TRAILER
                        </Button>
                    </div>
                </div>
            </section>

            {/* Top Ad */}
            <AdBanner className="mb-20" />

            {/* Game Grid */}
            <section className="mb-24 relative">
                {/* Section Background */}
                <div className="absolute inset-0 -mx-screen bg-white/5 skew-y-1 -z-10" />

                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                        <span className="w-2 h-10 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                        Trending Games
                    </h2>
                    <Button variant="ghost" className="text-lg font-medium hover:text-cyan-400">View All &rarr;</Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Neon Runner */}
                    <GameCard
                        title="Neon Runner"
                        id="neon-runner"
                        color="from-cyan-500 to-blue-600"
                        link="/game/neon-runner"
                        image="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
                    />

                    {/* Cyber Stack */}
                    <GameCard
                        title="Cyber Stack"
                        id="cyber-stack"
                        color="from-pink-500 to-purple-600"
                        link="/game/cyber-stack"
                        image="https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop"
                    />

                    {/* Placeholder Games */}
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="group relative w-full aspect-[16/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-white/20 hover:bg-white/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />
                            <span className="text-5xl mb-4 text-white/20 group-hover:text-white/40 transition-colors font-thin">+</span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Ad */}
            <AdBanner className="mt-8" />
        </Layout>
    )
}
