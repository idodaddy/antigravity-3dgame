import React from 'react'
import { useStore } from '../store'
import GameEndOverlay from '../../../components/GameEndOverlay'
import GameStartOverlay from '../../../components/GameStartOverlay'
import GameBackButton from '../../../components/GameBackButton'

export default function HUD() {
    const score = useStore(state => state.score)
    const level = useStore(state => state.level)
    const speed = useStore(state => state.speed)
    const lives = useStore(state => state.lives)
    const gameOver = useStore(state => state.gameOver)
    const gameStarted = useStore(state => state.gameStarted)
    const startGame = useStore(state => state.startGame)
    const reset = useStore(state => state.reset)
    const restart = useStore(state => state.restart)

    const rank = useStore(state => state.rank)
    const [showLevelUp, setShowLevelUp] = React.useState(false)

    React.useEffect(() => {
        if (level > 1) {
            setShowLevelUp(true)
            const timer = setTimeout(() => setShowLevelUp(false), 2000)
            return () => clearTimeout(timer)
        }
    }, [level])

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                if (!gameStarted && !gameOver) {
                    startGame()
                } else if (gameOver) {
                    restart()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, startGame, restart])

    const [comboScore, setComboScore] = React.useState(0)
    const [comboVisible, setComboVisible] = React.useState(false)
    const lastScore = React.useRef(score)
    const comboTimer = React.useRef(null)

    React.useEffect(() => {
        const diff = score - lastScore.current
        if (diff > 0) {
            setComboScore(prev => prev + diff)
            setComboVisible(true)

            if (comboTimer.current) clearTimeout(comboTimer.current)
            comboTimer.current = setTimeout(() => {
                setComboVisible(false)
                setComboScore(0)
            }, 2000)
        }
        lastScore.current = score
    }, [score])

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Ensure HUD doesn't block clicks
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'sans-serif',
            color: 'white',
        }}>
            {/* Top Center Total Score */}
            <div style={{
                position: 'absolute',
                top: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontSize: '72px',
                fontFamily: 'Impact, sans-serif',
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: '#ffff00',
                textShadow: '0 0 20px #ff9900, 3px 3px 0 #000',
                zIndex: 10,
                letterSpacing: '2px'
            }}>
                {Math.floor(score)}
            </div>

            {/* Responsive Container for HUD Stats */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', height: '100%', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '24px', textAlign: 'left' }}>
                        {/* Removed duplicate score display since it's now in center */}
                        <div style={{ fontSize: '18px', color: '#00ffcc', textShadow: '0 0 10px #00ffcc' }}>Level: {level}</div>
                        <div style={{ fontSize: '14px', color: '#aaa' }}>Speed: {speed.toFixed(1)}</div>
                        <div style={{ fontSize: '24px', color: '#ff0055', marginTop: '10px' }}>Lives: {'❤️'.repeat(lives)}</div>
                    </div>
                </div>
            </div>

            {!gameStarted && !gameOver && (
                <div style={{ pointerEvents: 'auto' }}>
                    <GameStartOverlay
                        title="NEON RUNNER"
                        instructions="Swipe or Click left/right to move. Avoid obstacles and collect minerals!"
                        onStart={() => {
                            // Request Fullscreen on Mobile
                            if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                                const doc = document.documentElement
                                if (doc.requestFullscreen) doc.requestFullscreen().catch(() => { })
                                else if (doc.webkitRequestFullscreen) doc.webkitRequestFullscreen().catch(() => { })
                                else if (doc.msRequestFullscreen) doc.msRequestFullscreen().catch(() => { })
                            }
                            startGame()
                        }}
                    />
                </div>
            )}

            {/* Level Up Indicator */}
            {showLevelUp && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 20,
                    animation: 'pulse 0.5s infinite alternate',
                }}>
                    <div style={{
                        fontSize: '120px',
                        fontFamily: 'Impact, sans-serif',
                        color: '#ffff00',
                        textShadow: '0 0 30px #ffff00, 4px 4px 0 #000',
                        fontStyle: 'italic'
                    }}>
                        {level}
                    </div>
                    <div style={{
                        fontSize: '40px',
                        fontFamily: 'Impact, sans-serif',
                        color: '#00ffcc',
                        marginTop: '-20px',
                        textShadow: '0 0 20px #00ffcc, 2px 2px 0 #000'
                    }}>
                        LEVEL UP!
                    </div>
                </div>
            )}

            {gameOver && <GameEndOverlay score={Math.floor(score)} rank={rank} onRestart={restart} />}
            <GameBackButton />
        </div>
    )
}
