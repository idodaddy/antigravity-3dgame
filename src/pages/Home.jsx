import React from 'react'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import AdBanner from '../components/AdBanner'
import Button from '../components/Button'

export default function Home() {
    return (
        <Layout>
            {/* Trending Games Grid */}
            <section className="mb-8 mt-8 relative">
                {/* Section Background */}
                <div className="absolute inset-0 -mx-screen bg-white/5 skew-y-1 -z-10" />

                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-bold text-white flex items-center gap-4">
                        <span className="w-2 h-10 bg-gradient-to-b from-cyan-500 to-purple-600 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                        Trending Games
                    </h2>
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

                    {/* Placeholder Games (4 items to make total 6) */}
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="group relative w-full aspect-[16/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-white/20 hover:bg-white/10">
                            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />
                            <span className="text-5xl mb-4 text-white/20 group-hover:text-white/40 transition-colors font-thin">+</span>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">Coming Soon</span>
                        </div>
                    ))}
                </div>
            </section>

            {/* Bottom Sponsor Ad */}
            <div className="mb-8 mt-auto">
                <div className="text-center text-gray-500 text-xs uppercase tracking-widest mb-2">Sponsor</div>
                <AdBanner />
            </div>
        </Layout>
    )
}
