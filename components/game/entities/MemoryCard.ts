import { STORY_CONFIG } from "@/config/story";

export interface MemoryCardState {
  id: string;
  x: number;
  y: number;
  triggered: boolean;
  title: string;
  subtitle: string;
  imagePath: string;
}

export function createMemoryCards(worldId: number, levelWidth: number, groundY: number): MemoryCardState[] {
  const worldMemories = STORY_CONFIG.memories.filter(m => m.world === worldId);
  return worldMemories.map(m => ({
    id: m.id,
    x: levelWidth * 0.6 + Math.random() * levelWidth * 0.2,
    y: groundY - 30,
    triggered: false,
    title: m.title,
    subtitle: m.subtitle,
    imagePath: m.imagePath,
  }));
}