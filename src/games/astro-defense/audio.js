// Audio Context Singleton
let audioCtx = null
let isPlayingBGM = false
let nextStepTime = 0
let currentStep = 0
let timerID = null

// TEMPO (French House / Nu-Disco speed)
const TEMPO = 124
const SECONDS_PER_BEAT = 60 / TEMPO
const STEPS_PER_BEAT = 4 // 16th notes
const SECONDS_PER_STEP = SECONDS_PER_BEAT / STEPS_PER_BEAT
const LOOKAHEAD = 0.1

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    }
    return audioCtx
}

// -------------------------------------------------------------------------
// SYNTHS
// -------------------------------------------------------------------------

// 1. Kick (Punchy, Compressed)
const triggerKick = (t, ctx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.5);
    gain.gain.setValueAtTime(1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.5);
}

// 2. Snare / Clap (Filtered noise + tone)
const triggerSnare = (t, ctx) => {
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1);

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1000;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.8, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(t);
}

// 3. Bass (Sawtooth funky bass)
const triggerBass = (t, ctx, freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 8;
    // Envelope filter: Wah effect
    filter.frequency.setValueAtTime(200, t);
    filter.frequency.exponentialRampToValueAtTime(2000, t + 0.05);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
}

// 4. Arp / Robot Lead
const triggerLead = (t, ctx, freq) => {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
}

// -------------------------------------------------------------------------
// SEQUENCER (1 Bar Loop = 16 Steps)
// -------------------------------------------------------------------------

// Key: D Minor
const F_D = 73.42;
const F_F = 87.31;
const F_G = 98.00;
const F_A = 110.00;
const F_C = 130.81;

// Bass Riff (One More Time / Aerodynamic ish)
// Patterns
const BASS_SEQ = [
    F_D, null, F_D, null, F_F, null, F_G, null,
    F_D, F_D, null, F_A, null, F_C, null, null
];

const LEAD_SEQ = [
    587.33, 587.33, null, null, 783.99, null, 698.46, null,
    587.33, null, null, null, 523.25, 523.25, 523.25, null
];

const scheduleRow = (step, time) => {
    const ctx = getAudioContext();
    const loopStep = step % 16;

    // Kick (4 on floor)
    if (loopStep % 4 === 0) triggerKick(time, ctx);

    // Snare (Backbeat)
    if (loopStep % 8 === 4) triggerSnare(time, ctx);

    // HiHat (Every offbeat)
    // if (loopStep % 2 !== 0) ... (let's keep it simple/clean)

    // Bass
    if (BASS_SEQ[loopStep]) triggerBass(time, ctx, BASS_SEQ[loopStep]);

    // Lead (Octave higher)
    if (loopStep % 4 === 2) {
        // Simple robotic chirp
        triggerLead(time, ctx, 880 + Math.sin(step) * 200);
    }
}

const scheduler = () => {
    const ctx = getAudioContext();
    while (nextStepTime < ctx.currentTime + LOOKAHEAD) {
        scheduleRow(currentStep, nextStepTime);
        nextStepTime += SECONDS_PER_STEP;
        currentStep++;
    }
    timerID = requestAnimationFrame(scheduler);
}

export const startBGM = () => {
    if (isPlayingBGM) return
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume()
    isPlayingBGM = true
    currentStep = 0
    nextStepTime = ctx.currentTime + 0.1
    scheduler()
}

export const stopBGM = () => {
    isPlayingBGM = false
    if (timerID) cancelAnimationFrame(timerID)
}

// SFX
export const playLaserSound = () => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.15);
}

export const playExplosionSound = () => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;
    // White noise
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, t);
    filter.frequency.exponentialRampToValueAtTime(10, t + 0.5);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
}

export const playDamageSound = () => {
    const ctx = getAudioContext();
    const t = ctx.currentTime;

    // Low frequency saw/square for "Ouch"
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(50, t + 0.3);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);

    // Distortion
    const shaper = ctx.createWaveShaper();
    shaper.curve = new Float32Array([-1, 1]); // Simple clip

    osc.connect(shaper);
    shaper.connect(gain);
    gain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + 0.3);
}
