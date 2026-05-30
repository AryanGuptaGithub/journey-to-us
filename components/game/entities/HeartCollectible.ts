import { STORY_CONFIG } from "@/config/story";

export interface HeartCollectibleState {
  id: number;
  x: number;
  y: number;
  baseY: number;
  bobTimer: number;
  collected: boolean;
  collectAnim: number; // 0→1 on collect
  message: string;
}

export function createHearts(levelWidth: number, groundY: number, density: number): HeartCollectibleState[] {
  const hearts: HeartCollectibleState[] = [];
  const msgs = STORY_CONFIG.heartMessages;
  const spacing = 200 / density;
  let id = 0;
  for (let x = 250; x < levelWidth - 200; x += spacing + Math.random() * 100) {
    const y = groundY - 40 - Math.random() * 80;
    hearts.push({
      id: id++,
      x, y, baseY: y,
      bobTimer: Math.random() * Math.PI * 2,
      collected: false,
      collectAnim: 0,
      message: msgs[id % msgs.length],
    });
  }
  return hearts;
}

export function updateHearts(hearts: HeartCollectibleState[], dt: number): HeartCollectibleState[] {
  return hearts.map(h => ({
    ...h,
    bobTimer: h.bobTimer + dt * 2.5,
    y: h.collected ? h.y - 80 * dt : h.baseY + Math.sin(h.bobTimer) * 6,
    collectAnim: h.collected ? Math.min(1, h.collectAnim + dt * 3) : 0,
  }));
}