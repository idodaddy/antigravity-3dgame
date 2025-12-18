import React from 'react'
import { Link } from 'react-router-dom'

export default function Button({
    children,
    variant = 'primary',
    to,
    onClick,
    className = '',
    icon
}) {
    const baseStyles = "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"

    const variants = {
        primary: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] border border-white/10",
        secondary: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:border-white/40",
        ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
        outline: "bg-transparent border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-white"
    }

    const Component = to ? Link : 'button'

    return (
        <Component
            to={to}
            onClick={onClick}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {icon && <span className="w-5 h-5">{icon}</span>}
            {children}
        </Component>
    )
}
