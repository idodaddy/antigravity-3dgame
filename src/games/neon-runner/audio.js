// Audio Context Singleton
let audioCtx = null
let isPlayingBGM = false
let nextStepTime = 0
let currentStep = 0
let timerID = null

// TEMPO & TIMING
const TEMPO = 125 // Slightly faster for energy
const SECONDS_PER_BEAT = 60 / TEMPO
const STEPS_PER_BEAT = 4 // 16th notes
const SECONDS_PER_STEP = SECONDS_PER_BEAT / STEPS_PER_BEAT
const LOOKAHEAD = 0.1 // Seconds

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx
}

// =========================================================================
// INSTRUMENTS (SYNTHESIS)
// =========================================================================

// 1. KICK DRUM
const triggerKick = (t, ctx) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5)
    gain.gain.setValueAtTime(1, t)
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.5)
}

// 2. SNARE / CLAP
const triggerSnare = (t, ctx) => {
    const bufferSize = ctx.sampleRate * 0.1
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource(); noise.buffer = buffer
    const noiseFilter = ctx.createBiquadFilter(); noiseFilter.type = 'highpass'; noiseFilter.frequency.value = 1000
    const noiseGain = ctx.createGain(); noiseGain.gain.setValueAtTime(0.8, t); noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1)
    noise.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(ctx.destination); noise.start(t)
    const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.setValueAtTime(800, t); osc.frequency.exponentialRampToValueAtTime(200, t + 0.1)
    const oscGain = ctx.createGain(); oscGain.gain.setValueAtTime(0.4, t); oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1)
    osc.connect(oscGain); oscGain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.1)
}

// 3. HI-HAT
const triggerHiHat = (t, ctx, open = false) => {
    const bufferSize = ctx.sampleRate * (open ? 0.3 : 0.05)
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource(); noise.buffer = buffer
    const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.value = 8000
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + (open ? 0.2 : 0.05))
    noise.connect(filter); filter.connect(gain); gain.connect(ctx.destination); noise.start(t)
}

// 4. FUNKY BASS
const triggerBass = (t, ctx, freq, duration) => {
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(freq, t)
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(200, t)
    filter.frequency.linearRampToValueAtTime(2000, t + 0.1)
    filter.frequency.exponentialRampToValueAtTime(200, t + duration)
    filter.Q.value = 5
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.5, t)
    gain.gain.linearRampToValueAtTime(0.5, t + duration - 0.05)
    gain.gain.linearRampToValueAtTime(0, t + duration)
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + duration)
}

// 5. DISCO CHORD STABS
const triggerChord = (t, ctx, frequencies, duration) => {
    const mainGain = ctx.createGain()
    mainGain.gain.setValueAtTime(0.25, t)
    mainGain.gain.exponentialRampToValueAtTime(0.01, t + duration)
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(3000, t); filter.Q.value = 1
    frequencies.forEach(freq => {
        const osc = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.setValueAtTime(freq, t)
        const osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(freq * 1.005, t)
        osc.connect(filter); osc2.connect(filter); osc.start(t); osc.stop(t + duration); osc2.start(t); osc2.stop(t + duration)
    })
    filter.connect(mainGain); mainGain.connect(ctx.destination)
}

// 6. MELODIC LEAD
const triggerLead = (t, ctx, freq, prevFreq, duration) => {
    const osc = ctx.createOscillator()
    osc.type = 'square'
    if (prevFreq) {
        osc.frequency.setValueAtTime(prevFreq, t)
        osc.frequency.exponentialRampToValueAtTime(freq, t + 0.05)
    } else {
        osc.frequency.setValueAtTime(freq, t)
    }
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(800, t); filter.frequency.linearRampToValueAtTime(3000, t + 0.1); filter.frequency.exponentialRampToValueAtTime(1000, t + duration); filter.Q.value = 2
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.15, t + 0.02); gain.gain.linearRampToValueAtTime(0.15, t + duration - 0.05); gain.gain.linearRampToValueAtTime(0, t + duration)
    const delay = ctx.createDelay(); delay.delayTime.value = 0.25; const delayGain = ctx.createGain(); delayGain.delayTime = 0.25; delayGain.gain.value = 0.4
    osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); gain.connect(delay); delay.connect(delayGain); delayGain.connect(ctx.destination); delayGain.connect(delay)
    osc.start(t); osc.stop(t + duration + 1.0)
}

// =========================================================================
// SEQUENCER PATTERNS (64 Steps = 4 Bars)
// =========================================================================

// Scale: C Minor / Dorian
// C2=65.41, Eb2=77.78, F2=87.31, G2=98.00, Ab2=103.83, Bb2=116.54

// CHORDS
const CHORD_C = [261.63, 311.13, 392.00, 466.16] // Cm7
const CHORD_F = [349.23, 415.30, 523.25, 622.25] // Fm7
const CHORD_Bb = [233.08, 293.66, 349.23, 466.16] // Bb7 (Dominant-ish)
const CHORD_Ab = [207.65, 261.63, 311.13, 392.00] // AbMaj7 (Climax chord)
const CHORD_G = [196.00, 246.94, 293.66, 349.23] // G7 (Resolution tension)

// FULL 64 STEP ARRAYS
const BASS_LINE = new Array(64).fill(null)
const CHORD_LINE = new Array(64).fill(null)
const MELODY_LINE = new Array(64).fill(null)

// --- BAR 1: PATTERN A (Intro/Groove) ---
// Bass driving C -> Eb
BASS_LINE[0] = { n: 65.41, len: 1 }      // C
BASS_LINE[2] = { n: 65.41, len: 1 }      // C
BASS_LINE[5] = { n: 116.54, len: 1 }     // Bb
BASS_LINE[7] = { n: 130.81, len: 1 }     // C3
BASS_LINE[8] = { n: 77.78, len: 2 }      // Eb
BASS_LINE[12] = { n: 87.31, len: 1 }     // F
BASS_LINE[14] = { n: 98.00, len: 1 }     // G

CHORD_LINE[0] = CHORD_C
CHORD_LINE[6] = CHORD_C
CHORD_LINE[8] = CHORD_Bb
CHORD_LINE[12] = CHORD_F

// --- BAR 2: PATTERN B (Melody Entry) ---
// Bass simpler sustain
BASS_LINE[16] = { n: 65.41, len: 1 }
BASS_LINE[18] = { n: 65.41, len: 1 }
BASS_LINE[21] = { n: 77.78, len: 1 }
BASS_LINE[23] = { n: 87.31, len: 1 }
BASS_LINE[24] = { n: 116.54, len: 2 }
BASS_LINE[28] = { n: 130.81, len: 1 }
BASS_LINE[30] = { n: 130.81, len: 1 }

CHORD_LINE[16] = CHORD_C
CHORD_LINE[24] = CHORD_Bb
CHORD_LINE[28] = CHORD_F

// Melody Starts (C5, Eb, F, G, Bb)
MELODY_LINE[16] = { n: 523.25, len: 1 } // C
MELODY_LINE[18] = { n: 622.25, len: 1 } // Eb
MELODY_LINE[20] = { n: 698.46, len: 1 } // F
MELODY_LINE[22] = { n: 783.99, len: 1.5 } // G
MELODY_LINE[26] = { n: 932.33, len: 1 } // Bb
MELODY_LINE[28] = { n: 1046.50, len: 1 } // C6
MELODY_LINE[30] = { n: 783.99, len: 1.5 } // G

// --- BAR 3: PATTERN C (Climax/Twist) ---
// Chords raise tension: AbMaj7 -> Bb7
BASS_LINE[32] = { n: 103.83, len: 2 } // Ab
BASS_LINE[36] = { n: 103.83, len: 2 } // Ab
BASS_LINE[40] = { n: 116.54, len: 2 } // Bb
BASS_LINE[44] = { n: 116.54, len: 2 } // Bb

CHORD_LINE[32] = CHORD_Ab
CHORD_LINE[36] = CHORD_Ab
CHORD_LINE[40] = CHORD_Bb
CHORD_LINE[44] = CHORD_Bb

// Melody goes higher
MELODY_LINE[32] = { n: 1046.50, len: 1 } // C6
MELODY_LINE[33] = { n: 1244.51, len: 1 } // Eb6
MELODY_LINE[36] = { n: 1396.91, len: 2 } // F6
MELODY_LINE[40] = { n: 1567.98, len: 1 } // G6
MELODY_LINE[42] = { n: 1396.91, len: 1 } // F6
MELODY_LINE[44] = { n: 1244.51, len: 2 } // Eb6

// --- BAR 4: PATTERN D (Resolution) ---
// G7 (Tension) -> C (Resolve)
BASS_LINE[48] = { n: 98.00, len: 2 } // G
BASS_LINE[52] = { n: 98.00, len: 2 } // G
BASS_LINE[56] = { n: 65.41, len: 4 } // C (Long Resolve)

CHORD_LINE[48] = CHORD_G
CHORD_LINE[52] = CHORD_G
CHORD_LINE[56] = CHORD_C
CHORD_LINE[60] = CHORD_C

// Melody Resolve
MELODY_LINE[48] = { n: 783.99, len: 1 } // G
MELODY_LINE[49] = { n: 87.31, len: 1 } // F
MELODY_LINE[50] = { n: 622.25, len: 1 } // Eb
MELODY_LINE[51] = { n: 587.33, len: 1 } // D
MELODY_LINE[52] = { n: 523.25, len: 4 } // C (Done)


let lastLeadFreq = null

const scheduleRow = (step, time) => {
    const ctx = getAudioContext()
    const loopStep = step % 64 // 4 Bar Loop
    const bar = Math.floor(loopStep / 16) // 0, 1, 2, 3

    // 1. KICK (Four on floor always solid)
    if (loopStep % 4 === 0) triggerKick(time, ctx)

    // 2. SNARE (Standard 2 & 4, plus fills in Bar 4)
    if (bar < 3) {
        if (loopStep % 8 === 4) triggerSnare(time, ctx)
    } else {
        // Bar 4: Fill at end
        if (loopStep % 8 === 4) triggerSnare(time, ctx)
        if (loopStep >= 60) triggerSnare(time, ctx) // da-da-da fill at end
    }

    // 3. HI-HAT 
    // Bar 3 (Climax): Open hats on offbeats for energy!
    if (bar === 2) {
        if (loopStep % 2 !== 0) triggerHiHat(time, ctx, true) // Always open on &s in climax
    } else {
        if (loopStep % 2 !== 0) triggerHiHat(time, ctx, loopStep % 4 === 2)
    }

    // 4. BASS
    const bassNote = BASS_LINE[loopStep]
    if (bassNote) {
        triggerBass(time, ctx, bassNote.n, bassNote.len * SECONDS_PER_STEP)
    }

    // 5. CHORDS
    const chord = CHORD_LINE[loopStep]
    if (chord) {
        triggerChord(time, ctx, chord, 0.3)
    }

    // 6. LEAD
    const leadNote = MELODY_LINE[loopStep]
    if (leadNote) {
        triggerLead(time, ctx, leadNote.n, lastLeadFreq, leadNote.len * SECONDS_PER_STEP)
        lastLeadFreq = leadNote.n
    }
}

const scheduler = () => {
    const ctx = getAudioContext()
    while (nextStepTime < ctx.currentTime + LOOKAHEAD) {
        scheduleRow(currentStep, nextStepTime)
        nextStepTime += SECONDS_PER_STEP
        currentStep++
    }
    timerID = requestAnimationFrame(scheduler)
}

// =========================================================================
// PUBLIC API
// =========================================================================

export const startBGM = () => {
    if (isPlayingBGM) return
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    isPlayingBGM = true
    currentStep = 0
    nextStepTime = ctx.currentTime + 0.1
    lastLeadFreq = null
    scheduler()
}

export const stopBGM = () => {
    isPlayingBGM = false
    if (timerID) cancelAnimationFrame(timerID)
}

export const playJumpSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime
    const osc1 = ctx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(200, t); osc1.frequency.exponentialRampToValueAtTime(800, t + 0.3)
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.15, t + 0.05); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3)
    const filter = ctx.createBiquadFilter(); filter.type = 'highpass'; filter.frequency.setValueAtTime(100, t); filter.frequency.linearRampToValueAtTime(1000, t + 0.3)
    osc1.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc1.start(t); osc1.stop(t + 0.3)
}

export const playCrashSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime
    const osc = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(10, t + 0.8)
    const gain = ctx.createGain(); gain.gain.setValueAtTime(0.8, t); gain.gain.linearRampToValueAtTime(0.8, t + 0.1); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.8)
    const lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.setValueAtTime(30, t); const lfoGain = ctx.createGain(); lfoGain.gain.value = 500
    lfo.connect(lfoGain); lfoGain.connect(gain.gain); osc.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.8); lfo.start(t); lfo.stop(t + 0.8)
}

export const playCollectSound = () => {
    const ctx = getAudioContext()
    const t = ctx.currentTime
    const osc1 = ctx.createOscillator(); osc1.type = 'sine'; osc1.frequency.setValueAtTime(1567.98, t); const gain1 = ctx.createGain(); gain1.gain.setValueAtTime(0, t); gain1.gain.linearRampToValueAtTime(0.3, t + 0.01); gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.5); osc1.connect(gain1); gain1.connect(ctx.destination); osc1.start(t); osc1.stop(t + 0.5)
    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.setValueAtTime(2093.00, t + 0.05); const gain2 = ctx.createGain(); gain2.gain.setValueAtTime(0, t + 0.05); gain2.gain.linearRampToValueAtTime(0.2, t + 0.06); gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.6); osc2.connect(gain2); gain2.connect(ctx.destination); osc2.start(t + 0.05); osc2.stop(t + 0.6)
}
