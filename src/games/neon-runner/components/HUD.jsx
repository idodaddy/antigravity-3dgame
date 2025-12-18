import React from 'react'
import { useStore } from '../store'

export default function HUD() {
    const score = useStore(state => state.score)
    const level = useStore(state => state.level)
    const speed = useStore(state => state.speed)
    const lives = useStore(state => state.lives)
    const gameOver = useStore(state => state.gameOver)
    const gameStarted = useStore(state => state.gameStarted)
    const startGame = useStore(state => state.startGame)
    const reset = useStore(state => state.reset)

    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                if (!gameStarted && !gameOver) {
                    startGame()
                } else if (gameOver) {
                    reset()
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [gameStarted, gameOver, startGame, reset])

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
            <div style={{ position: 'absolute', top: 20, left: 20, fontSize: '24px', textAlign: 'left' }}>
                <div>Score: {Math.floor(score)}</div>
                <div style={{ fontSize: '18px', color: '#00ffcc' }}>Level: {level}</div>
                <div style={{ fontSize: '14px', color: '#aaa' }}>Speed: {speed.toFixed(1)}</div>
                <div style={{ fontSize: '24px', color: '#ff0055', marginTop: '10px' }}>Lives: {'❤️'.repeat(lives)}</div>
            </div>

            {!gameStarted && !gameOver && (
                <div style={{ pointerEvents: 'auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '64px', marginBottom: '20px', color: '#00ffcc' }}>NEON RUNNER</h1>
                    <button
                        onClick={startGame}
                        style={{
                            padding: '15px 40px',
                            fontSize: '24px',
                            background: '#ff00cc',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            boxShadow: '0 0 20px #ff00cc'
                        }}
                    >
                        START GAME
                    </button>
                    <p style={{ marginTop: '20px' }}>Press Space, Click, or Tap to Start</p>
                </div>
            )}

            {gameOver && (
                <div style={{ pointerEvents: 'auto', textAlign: 'center', background: 'rgba(0,0,0,0.8)', padding: '40px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
                    <h1 style={{ fontSize: '80px', marginBottom: '10px', color: '#ff0055', fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}>GAME OVER</h1>
                    <p style={{ fontSize: '32px', marginBottom: '40px', color: '#fff', fontFamily: 'Outfit, sans-serif' }}>Final Score: <span style={{ color: '#00ffcc' }}>{Math.floor(score)}</span></p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button
                            onClick={() => window.location.href = '/'}
                            style={{
                                padding: '15px 30px',
                                fontSize: '20px',
                                background: 'transparent',
                                border: '2px solid #fff',
                                color: 'white',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                fontFamily: 'Rajdhani, sans-serif',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.target.style.background = 'rgba(255,255,255,0.1)' }}
                            onMouseOut={(e) => { e.target.style.background = 'transparent' }}
                        >
                            Home
                        </button>
                        <button
                            onClick={reset}
                            style={{
                                padding: '15px 40px',
                                fontSize: '24px',
                                background: 'linear-gradient(90deg, #00ffcc, #0099ff)',
                                border: 'none',
                                color: 'black',
                                cursor: 'pointer',
                                borderRadius: '10px',
                                boxShadow: '0 0 30px rgba(0, 255, 204, 0.5)',
                                fontFamily: 'Rajdhani, sans-serif',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                transition: 'all 0.3s'
                            }}
                            onMouseOver={(e) => { e.target.style.transform = 'scale(1.05)' }}
                            onMouseOut={(e) => { e.target.style.transform = 'scale(1)' }}
                        >
                            Try Again
                        </button>
                    </div>
                    <p style={{ marginTop: '30px', fontSize: '14px', opacity: 0.6, fontFamily: 'Outfit, sans-serif' }}>Press Space or Tap to Restart</p>
                </div>
            )}
        </div>
    )
}
