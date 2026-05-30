export interface ObstacleConfig {
  type: string;
  label: string;
  x: number;
  slowAmount: number;
  symbol: string;
}

export interface WorldConfig {
  id: number;
  name: string;
  chapterTitle: string;
  chapterSubtitle: string;
  skyColors: [string, string];
  groundColor: string;
  groundLineColor: string;
  accentColor: string;
  musicTrack: string;
  obstacles: ObstacleConfig[];
  heartDensity: number;
  levelWidth: number;
  hasRain: boolean;
  hasWind: boolean;
  hasPlatforms: boolean;
  groundY: number; // fraction of canvas height
  particleType: "petal" | "rain" | "firefly" | "snow" | "none";
}

export const WORLDS: WorldConfig[] = [
  {
    id: 1,
    name: "Sakura Town",
    chapterTitle: "Chapter 1",
    chapterSubtitle: "Every story has a beginning...",
    skyColors: ["#ffe4f0", "#f9c4d8"],
    groundColor: "#7bc67e",
    groundLineColor: "#5aab5e",
    accentColor: "#ff7eb6",
    musicTrack: "sakura.mp3",
    obstacles: [
      { type: "phone",  label: "Missed Calls",   x: 500,  slowAmount: 0.3, symbol: "📱" },
      { type: "clock",  label: "Busy Schedules", x: 900,  slowAmount: 0.25, symbol: "⏰" },
      { type: "book",   label: "Exams",          x: 1400, slowAmount: 0.2, symbol: "📚" },
      { type: "clock",  label: "No Time",        x: 1900, slowAmount: 0.25, symbol: "⏰" },
      { type: "phone",  label: "Missed Calls",   x: 2400, slowAmount: 0.3, symbol: "📱" },
    ],
    heartDensity: 1.2,
    levelWidth: 3200,
    hasRain: false,
    hasWind: false,
    hasPlatforms: false,
    groundY: 0.72,
    particleType: "petal",
  },
  {
    id: 2,
    name: "Rainy City",
    chapterTitle: "Chapter 2",
    chapterSubtitle: "Even on the hardest days...",
    skyColors: ["#1e2a45", "#2d3a5a"],
    groundColor: "#3a4a6a",
    groundLineColor: "#546e8a",
    accentColor: "#a2d2ff",
    musicTrack: "rain.mp3",
    obstacles: [
      { type: "rain_cloud", label: "Bad Days",      x: 450,  slowAmount: 0.35, symbol: "🌧️" },
      { type: "battery",    label: "Low Battery",   x: 850,  slowAmount: 0.3, symbol: "🪫" },
      { type: "distance",   label: "Miles Apart",   x: 1300, slowAmount: 0.4, symbol: "🗺️" },
      { type: "rain_cloud", label: "Bad Days",      x: 1750, slowAmount: 0.35, symbol: "🌧️" },
      { type: "battery",    label: "Low Battery",   x: 2200, slowAmount: 0.3, symbol: "🪫" },
      { type: "distance",   label: "Miles Apart",   x: 2700, slowAmount: 0.4, symbol: "🗺️" },
    ],
    heartDensity: 1.0,
    levelWidth: 3400,
    hasRain: true,
    hasWind: false,
    hasPlatforms: false,
    groundY: 0.74,
    particleType: "rain",
  },
  {
    id: 3,
    name: "Ancient Temple",
    chapterTitle: "Chapter 3",
    chapterSubtitle: "Adventure is better together.",
    skyColors: ["#ff9f1c", "#ffca7a"],
    groundColor: "#8b6914",
    groundLineColor: "#6b4f10",
    accentColor: "#ff9f1c",
    musicTrack: "temple.mp3",
    obstacles: [
      { type: "briefcase", label: "Work Trips",        x: 500,  slowAmount: 0.25, symbol: "💼" },
      { type: "wall",      label: "Hard Convos",       x: 950,  slowAmount: 0.45, symbol: "🧱" },
      { type: "hourglass", label: "Waiting",           x: 1400, slowAmount: 0.3, symbol: "⏳" },
      { type: "briefcase", label: "Work Trips",        x: 1900, slowAmount: 0.25, symbol: "💼" },
      { type: "wall",      label: "Hard Convos",       x: 2400, slowAmount: 0.45, symbol: "🧱" },
    ],
    heartDensity: 1.1,
    levelWidth: 3400,
    hasRain: false,
    hasWind: false,
    hasPlatforms: true,
    groundY: 0.74,
    particleType: "firefly",
  },
  {
    id: 4,
    name: "Mountain Peak",
    chapterTitle: "Chapter 4",
    chapterSubtitle: "Worth every difficult moment.",
    skyColors: ["#1a0a4e", "#6b2fa0"],
    groundColor: "#8899aa",
    groundLineColor: "#aabbcc",
    accentColor: "#cdb4db",
    musicTrack: "mountain.mp3",
    obstacles: [
      { type: "wind",    label: "Strong Winds",   x: 400,  slowAmount: 0.5, symbol: "💨" },
      { type: "ice",     label: "Slippery Path",  x: 800,  slowAmount: 0.15, symbol: "🧊" },
      { type: "boulder", label: "Tough Moments",  x: 1200, slowAmount: 0.4, symbol: "🪨" },
      { type: "wind",    label: "Strong Winds",   x: 1700, slowAmount: 0.5, symbol: "💨" },
      { type: "ice",     label: "Slippery Path",  x: 2100, slowAmount: 0.15, symbol: "🧊" },
      { type: "boulder", label: "Tough Moments",  x: 2600, slowAmount: 0.4, symbol: "🪨" },
    ],
    heartDensity: 0.9,
    levelWidth: 3600,
    hasRain: false,
    hasWind: true,
    hasPlatforms: false,
    groundY: 0.72,
    particleType: "snow",
  },
  {
    id: 5,
    name: "Sunset Beach",
    chapterTitle: "Chapter 5",
    chapterSubtitle: "The journey was always worth it.",
    skyColors: ["#ff6b35", "#ffb347"],
    groundColor: "#f9d89c",
    groundLineColor: "#e8c070",
    accentColor: "#ff9f1c",
    musicTrack: "beach.mp3",
    obstacles: [], // No obstacles — the hard part is over
    heartDensity: 2.0,
    levelWidth: 2400,
    hasRain: false,
    hasWind: false,
    hasPlatforms: false,
    groundY: 0.75,
    particleType: "none",
  },
];