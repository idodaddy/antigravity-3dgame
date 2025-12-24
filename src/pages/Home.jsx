import React from 'react'
import Layout from '../components/Layout'
import GameCard from '../components/GameCard'
import AdBanner from '../components/AdBanner'
import Button from '../components/Button'

export default function Home() {
    return (
        <Layout>
            {/* Game Grid */}
            <section className="mb-8 mt-2 relative">
                {/* Section Background */}
                <div className="absolute inset-0 -mx-screen bg-white/5 skew-y-1 -z-10" />

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
                    {/* Game List */}
                    {[
                        {
                            id: "neon-runner",
                            title: "Neon Runner",
                            color: "from-cyan-500 to-blue-600",
                            link: "/game/neon-runner",
                            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            id: "cyber-stack",
                            title: "Cyber Stack",
                            color: "from-pink-500 to-purple-600",
                            link: "/game/cyber-stack",
                            image: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            id: "neon-snake",
                            title: "Neon Snake",
                            color: "from-green-500 to-emerald-600",
                            link: "/game/neon-snake",
                            image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            id: "astro-defense",
                            title: "Astro Defense",
                            color: "from-indigo-500 to-purple-600",
                            link: "/game/astro-defense",
                            image: "/astro-defense-card.png"
                        },
                        // Placeholders
                        ...[1, 2, 3, 4].map(i => ({ id: `placeholder-${i}`, isPlaceholder: true }))
                    ].map((game, index) => (
                        <React.Fragment key={game.id}>
                            {/* Insert Ad after 6th item (index 5) */}
                            {index === 6 && (
                                <div className="col-span-2 md:hidden w-full my-2">
                                    <AdBanner />
                                </div>
                            )}

                            {game.isPlaceholder ? (
                                <div className="group relative w-full aspect-[16/9] rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex flex-col items-center justify-center transition-all hover:border-white/20 hover:bg-white/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/50" />
                                    <span className="text-3xl mb-2 text-white/20 group-hover:text-white/40 transition-colors font-thin">+</span>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">Coming Soon</span>
                                </div>
                            ) : (
                                <GameCard
                                    title={game.title}
                                    id={game.id}
                                    color={game.color}
                                    link={game.link}
                                    image={game.image}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </section>

            {/* AdSense Banner (Moved to bottom) */}
            <div className="mb-12">
                <AdBanner />
            </div>
        </Layout>
    )
}
