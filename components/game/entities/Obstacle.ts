import type { ObstacleConfig } from "@/config/worlds";

export interface ObstacleState extends ObstacleConfig {
  hitCooldown: number; // seconds
  flash: number;       // seconds (visual flash on hit)
  bobOffset: number;   // for floating animation
  bobTimer: number;
}

export function createObstacles(configs: ObstacleConfig[]): ObstacleState[] {
  return configs.map((c, i) => ({
    ...c,
    hitCooldown: 0,
    flash: 0,
    bobOffset: 0,
    bobTimer: i * 0.7, // offset each one
  }));
}

export function updateObstacles(obstacles: ObstacleState[], dt: number): ObstacleState[] {
  return obstacles.map(o => ({
    ...o,
    hitCooldown: Math.max(0, o.hitCooldown - dt),
    flash: Math.max(0, o.flash - dt),
    bobTimer: o.bobTimer + dt,
    bobOffset: Math.sin(o.bobTimer * 2) * 4,
  }));
}

export const OBSTACLE_SIZE = 44;