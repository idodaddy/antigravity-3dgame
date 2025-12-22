import React from 'react'
import { useStore } from '../store'
import GameEndOverlay from '../../../components/GameEndOverlay'
import GameStartOverlay from '../../../components/GameStartOverlay'

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

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            fontFamily: 'sans-serif',
            textShadow: '0 0 10px #ff00cc'
        }}>
            {/* Responsive Container for HUD Stats */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <div style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', height: '100%', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '24px', textAlign: 'left' }}>
                        <div>Score: {Math.floor(score)}</div>
                        <div style={{ fontSize: '18px', color: '#00ffcc' }}>Level: {level}</div>
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
                        onStart={startGame}
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
                    fontSize: '64px',
                    color: '#00ffcc',
                    fontWeight: 'bold',
                    textShadow: '0 0 20px #00ffcc',
                    animation: 'pulse 0.5s infinite alternate',
                    zIndex: 20
                }}>
                    LEVEL UP!
                </div>
            )}

            {gameOver && <GameEndOverlay score={Math.floor(score)} rank={rank} onRestart={restart} />}
        </div>
    )
}
