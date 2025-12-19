// Audio Context Singleton
let audioCtx = null
let bgmOscillators = []
let nextNoteTime = 0
let isPlayingBGM = false
let timerID = null

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx
}

export const playJumpSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime

    // Futuristic "Phaser" Jump
    const osc1 = ctx.createOscillator()
    osc1.type = 'sawtooth'
    osc1.frequency.setValueAtTime(200, t)
    osc1.frequency.exponentialRampToValueAtTime(800, t + 0.3)

    const osc2 = ctx.createOscillator()
    osc2.type = 'square'
    osc2.frequency.setValueAtTime(205, t) // Detuned
    osc2.frequency.exponentialRampToValueAtTime(820, t + 0.3)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)

    const filter = ctx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.setValueAtTime(100, t)
    filter.frequency.linearRampToValueAtTime(1000, t + 0.3)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc1.start(t)
    osc2.start(t)
    osc1.stop(t + 0.3)
    osc2.stop(t + 0.3)
}

export const playCrashSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime

    // Sub-bass impact
    const subOsc = ctx.createOscillator()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(80, t)
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.5)

    const subGain = ctx.createGain()
    subGain.gain.setValueAtTime(0.8, t)
    subGain.gain.exponentialRampToValueAtTime(0.01, t + 0.5)

    subOsc.connect(subGain)
    subGain.connect(ctx.destination)
    subOsc.start(t)
    subOsc.stop(t + 0.5)

    // Noise Crash
    const bufferSize = ctx.sampleRate * 0.5
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(3000, t)
    filter.frequency.exponentialRampToValueAtTime(100, t + 0.4)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4)

    noise.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    noise.start(t)
}

export const playCollectSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime

    // Cheerful "Ting-Ting" (Two high pitched bell tones)

    // First Tone
    const osc1 = ctx.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1567.98, t) // G6

    const gain1 = ctx.createGain()
    gain1.gain.setValueAtTime(0, t)
    gain1.gain.linearRampToValueAtTime(0.3, t + 0.01)
    gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5)

    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(t)
    osc1.stop(t + 0.5)

    // Second Tone (Harmonic/Harmony) slightly delayed
    const osc2 = ctx.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(2093.00, t + 0.05) // C7

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0, t + 0.05)
    gain2.gain.linearRampToValueAtTime(0.2, t + 0.06)
    gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.6)

    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(t + 0.05)
    osc2.stop(t + 0.6)
}

// Melodic BGM Sequence (C Minor Arpeggio with variations)
// C3, Eb3, G3, Bb3, C4, Bb3, G3, Eb3
const NOTES = [
    130.81, 155.56, 196.00, 233.08, 261.63, 233.08, 196.00, 155.56, // C Minor
    116.54, 138.59, 174.61, 207.65, 233.08, 207.65, 174.61, 138.59  // Bb Majorish transition
]
const TEMPO = 0.2 // Slower, more melodic

const scheduleNote = () => {
    if (!isPlayingBGM) return

    const ctx = getAudioContext()
    const t = ctx.currentTime

    // Schedule ahead
    while (nextNoteTime < t + 0.1) {
        const osc = ctx.createOscillator()
        osc.type = 'triangle' // Softer, more flute-like

        // Pick note from sequence
        const noteIndex = Math.floor(nextNoteTime / TEMPO) % NOTES.length
        const freq = NOTES[noteIndex]

        osc.frequency.setValueAtTime(freq, nextNoteTime)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.0, nextNoteTime)
        gain.gain.linearRampToValueAtTime(0.1, nextNoteTime + 0.05) // Soft attack
        gain.gain.linearRampToValueAtTime(0.0, nextNoteTime + TEMPO * 1.1) // Smooth release

        // Reverb-ish delay (fake)
        const delay = ctx.createDelay()
        delay.delayTime.value = 0.15
        const delayGain = ctx.createGain()
        delayGain.gain.value = 0.3

        osc.connect(gain)
        gain.connect(ctx.destination)

        // Add delay line
        gain.connect(delay)
        delay.connect(delayGain)
        delayGain.connect(ctx.destination)

        osc.start(nextNoteTime)
        osc.stop(nextNoteTime + TEMPO * 1.5)

        nextNoteTime += TEMPO
    }

    timerID = requestAnimationFrame(scheduleNote)
}

export const startBGM = () => {
    if (isPlayingBGM) return
    const ctx = getAudioContext()

    // Resume context if suspended (browser policy)
    if (ctx.state === 'suspended') {
        ctx.resume()
    }

    isPlayingBGM = true
    nextNoteTime = ctx.currentTime + 0.1
    scheduleNote()
}

export const stopBGM = () => {
    isPlayingBGM = false
    if (timerID) cancelAnimationFrame(timerID)
}
