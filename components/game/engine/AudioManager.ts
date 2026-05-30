import { AUDIO_CONFIG } from "@/config/audio";

export class AudioManager {
  private current: HTMLAudioElement | null = null;
  private currentTrack: string = "";
  private enabled: boolean = true;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on && this.current) {
      this.fadeOut(this.current, 500);
    } else if (on && this.currentTrack) {
      this.play(this.currentTrack);
    }
  }

  play(trackName: string) {
    if (!this.enabled) return;
    if (this.currentTrack === trackName && this.current && !this.current.paused) return;

    const cfg = AUDIO_CONFIG.tracks[trackName];
    if (!cfg) return;

    const prev = this.current;
    this.currentTrack = trackName;

    const audio = new Audio(cfg.src);
    audio.loop = cfg.loop;
    audio.volume = 0;

    audio.play().catch(() => {
      // Autoplay blocked — silently fail
    });

    // Fade in
    this.fadeIn(audio, cfg.volume * AUDIO_CONFIG.masterVolume, AUDIO_CONFIG.crossFadeDuration);

    // Fade out previous
    if (prev) {
      this.fadeOut(prev, AUDIO_CONFIG.crossFadeDuration);
    }

    this.current = audio;
  }

  stop() {
    if (this.current) {
      this.fadeOut(this.current, 600);
      this.current = null;
      this.currentTrack = "";
    }
  }

  private fadeIn(audio: HTMLAudioElement, targetVol: number, durationMs: number) {
    const steps = 30;
    const stepTime = durationMs / steps;
    const stepVol = targetVol / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.min(targetVol, audio.volume + stepVol);
      if (step >= steps) clearInterval(interval);
    }, stepTime);
  }

  private fadeOut(audio: HTMLAudioElement, durationMs: number) {
    const steps = 30;
    const stepTime = durationMs / steps;
    const startVol = audio.volume;
    const stepVol = startVol / steps;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      audio.volume = Math.max(0, audio.volume - stepVol);
      if (step >= steps) {
        clearInterval(interval);
        audio.pause();
      }
    }, stepTime);
  }
}

export const audioManager = new AudioManager();