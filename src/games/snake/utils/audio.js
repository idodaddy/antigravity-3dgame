// Funky Audio for Neon Snake

let audioCtx = null;
let bgmNodes = [];
let isMuted = false;

const initAudio = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
};

// Funky Bassline Generator
const playBassNote = (ctx, freq, time, duration) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, time);
    filter.frequency.exponentialRampToValueAtTime(1000, time + 0.1);
    filter.frequency.exponentialRampToValueAtTime(200, time + duration - 0.1);

    gain.gain.setValueAtTime(0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(time);
    osc.stop(time + duration);
};

// Funky Hi-hat
const playHiHat = (ctx, time) => {
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    src.start(time);
};

export const startBGM = () => {
    if (bgmNodes.length > 0) return; // Already playing
    const ctx = initAudio();

    const tempo = 100; // Slower, groovier
    const beatTime = 60 / tempo;
    const loopDuration = 30; // 30 seconds
    let nextNoteTime = ctx.currentTime;

    // Chords: Bbmaj7 -> Am7 -> Dm7 -> Gm7 (Soulful/French Touch)
    // Frequencies for chords
    const chords = [
        [233.08, 293.66, 349.23, 415.30], // Bbmaj7 (Bb, D, F, Ab) -> Actually Ab is Bb7. Bbmaj7 is A. Let's use Bbmaj7: Bb, D, F, A (440)
        [220.00, 261.63, 329.63, 392.00], // Am7 (A, C, E, G)
        [146.83, 174.61, 220.00, 261.63], // Dm7 (D, F, A, C)
        [196.00, 233.08, 293.66, 349.23]  // Gm7 (G, Bb, D, F)
    ];

    // Bass Line (Groovy)
    const bassPattern = [
        { t: 0, n: 58.27 }, { t: 0.75, n: 58.27 }, { t: 1.5, n: 65.41 }, // Bb
        { t: 4, n: 55.00 }, { t: 4.75, n: 55.00 }, { t: 5.5, n: 65.41 }, // A
        { t: 8, n: 73.42 }, { t: 8.75, n: 73.42 }, { t: 9.5, n: 87.31 }, // D
        { t: 12, n: 49.00 }, { t: 12.75, n: 49.00 }, { t: 13.5, n: 58.27 } // G
    ];

    let beatCount = 0;
    let isPlaying = true;

    const scheduler = () => {
        if (!isPlaying) return;

        while (nextNoteTime < ctx.currentTime + 0.1) {
            const currentBeat = beatCount % (loopDuration / beatTime * 4); // Infinite loop logic roughly

            // Drums (Kick/Snare)
            if (beatCount % 1 === 0) playKick(ctx, nextNoteTime); // Kick on every beat
            if (beatCount % 2 === 1) playSnare(ctx, nextNoteTime); // Snare on 2 and 4

            // Hats (16th notes)
            for (let i = 0; i < 4; i++) {
                playHiHat(ctx, nextNoteTime + i * (beatTime / 4), i === 2); // Accent on 3rd 16th (open hat feel)
            }

            // Chords (Change every 4 beats / 1 bar)
            const chordIndex = Math.floor((beatCount % 16) / 4);
            if (beatCount % 4 === 0) {
                chords[chordIndex].forEach((freq, i) => {
                    playChordNote(ctx, freq, nextNoteTime, beatTime * 4, i);
                });
            }

            // Bass
            // Map beatCount to bass pattern
            // Simple logic: play bass note if current beat matches pattern time (modulo 4 bars)
            const barTime = beatCount % 16; // 0 to 15.99
            // This is tricky with the array structure. Let's just play a simple groove.
            // Root notes based on chord
            const roots = [58.27, 55.00, 73.42, 49.00]; // Bb, A, D, G
            const root = roots[chordIndex];

            // Groove: 1, 2&, 4
            playBassNote(ctx, root, nextNoteTime, beatTime * 0.5);
            playBassNote(ctx, root, nextNoteTime + beatTime * 1.5, beatTime * 0.5);
            playBassNote(ctx, root * 1.5, nextNoteTime + beatTime * 3.0, beatTime * 0.25); // 5th pop

            nextNoteTime += beatTime;
            beatCount++;
        }

        const timerId = setTimeout(scheduler, 25);
        bgmNodes.push({ stop: () => { isPlaying = false; clearTimeout(timerId); } });
    };

    scheduler();
};

const playKick = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(0.01, time + 0.5);
    gain.gain.setValueAtTime(0.8, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.5);
}

const playSnare = (ctx, time) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + 0.2);

    // Noise
    const bufferSize = ctx.sampleRate * 0.2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(time);
}

const playChordNote = (ctx, freq, time, duration, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = index % 2 === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(freq, time);
    // Detune slightly for chorus effect
    osc.detune.value = Math.random() * 10 - 5;

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.1, time + 0.1); // Soft attack
    gain.gain.setValueAtTime(0.1, time + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, time + duration); // Release

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(time);
    osc.stop(time + duration);
}

export const stopBGM = () => {
    bgmNodes.forEach(node => node.stop());
    bgmNodes = [];
};

export const playEatSound = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
};

export const playDieSound = () => {
    const ctx = initAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.5);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.5);
};
