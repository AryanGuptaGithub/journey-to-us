export const AUDIO_CONFIG = {
  masterVolume: 0.5,
  crossFadeDuration: 1500,
  tracks: {
    title:    { src: "/Audio/title.mp3",    loop: true,  volume: 0.5 },
    sakura:   { src: "/Audio/sakura.mp3",   loop: true,  volume: 0.6 },
    rain:     { src: "/Audio/rain.mp3",     loop: true,  volume: 0.55 },
    temple:   { src: "/Audio/temple.mp3",   loop: true,  volume: 0.6 },
    mountain: { src: "/Audio/mountain.mp3", loop: true,  volume: 0.65 },
    beach:    { src: "/Audio/beach.mp3",    loop: true,  volume: 0.6 },
    reunion:  { src: "/Audio/reunion.mp3",  loop: false, volume: 0.7 },
    sunset:   { src: "/Audio/sunset.mp3",   loop: true,  volume: 0.5 },
  } as Record<string, { src: string; loop: boolean; volume: number }>,
};
