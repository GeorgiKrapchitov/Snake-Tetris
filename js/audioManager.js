// Audio Manager for game sounds and music
export class AudioManager {
    constructor() {
        this.sounds = {};
        this.music = null;
        this.enabled = true;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.5;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        // Create AudioContext for better control
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported, using fallback');
        }

        // Define sound sources (using data URIs for simple beep sounds)
        // In production, replace with actual audio files
        this.soundSources = {
            food: this.createBeep(440, 0.1), // A note
            collision: this.createBeep(200, 0.3), // Low note
            lineClear: this.createBeep(550, 0.2), // C# note
            powerUp: this.createBeep(660, 0.15), // E note
            achievement: this.createBeep(880, 0.2), // A note (higher)
            move: this.createBeep(330, 0.05), // E note (short)
            rotate: this.createBeep(370, 0.05) // F# note (short)
        };

        this.initialized = true;
    }

    // Create a simple beep sound using Web Audio API
    createBeep(frequency, duration) {
        return () => {
            if (!this.enabled || !this.audioContext) return;

            try {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.value = frequency;
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(this.sfxVolume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            } catch (e) {
                console.warn('Failed to play sound:', e);
            }
        };
    }

    play(soundName) {
        if (!this.enabled || !this.initialized) return;

        const soundFunc = this.soundSources[soundName];
        if (soundFunc) {
            soundFunc();
        }
    }

    playMusic() {
        // Music functionality placeholder
        // In production, load and play actual background music
        console.log('Background music would play here');
    }

    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.music) {
            this.music.volume = this.musicVolume;
        }
    }

    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    toggle() {
        this.enabled = !this.enabled;
        if (!this.enabled) {
            this.stopMusic();
        }
        return this.enabled;
    }
}

export default new AudioManager();