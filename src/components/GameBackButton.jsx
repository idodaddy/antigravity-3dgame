import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function GameBackButton({ className = '' }) {
    const navigate = useNavigate()

    return (
        <button
            className={`pointer-events-auto p-2 bg-white/10 rounded-full hover:bg-white/20 transition backdrop-blur-md absolute top-4 left-4 z-40 ${className}`}
            onClick={() => navigate('/')}
            title="Back to Home"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
            </svg>
        </button>
    )
}
