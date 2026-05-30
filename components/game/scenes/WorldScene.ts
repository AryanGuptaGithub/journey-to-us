import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import { applyCameraTransform, restoreCamera } from "../engine/Camera";
import type { Camera } from "../engine/gameReducer";
import type { WorldConfig } from "@/config/worlds";
import type { PlayerState } from "../entities/Player";
import type { PartnerState } from "../entities/Partner";
import type { ObstacleState } from "../entities/Obstacle";
import type { HeartCollectibleState } from "../entities/HeartCollectible";
import type { MemoryCardState } from "../entities/MemoryCard";
import { drawHim, drawHer } from "../entities/Characters";

const PLATFORM_DEFS = [
  { x: 400, w: 120 }, { x: 700, w: 100 },
  { x: 1050, w: 130 }, { x: 1400, w: 110 }, { x: 1800, w: 120 },
];

export interface WorldSceneState {
  time: number;
  particles: ParticleSystem;
  bgParticles: ParticleSystem;
  cloudX: number[];
  treePositions: number[];
  windTimer: number;
}

export function createWorldScene(canvasW: number, canvasH: number): WorldSceneState {
  const clouds = Array.from({ length: 7 }, (_, i) => (i / 7) * canvasW * 2);
  const trees = Array.from({ length: 14 }, (_, i) => 80 + i * 230 + Math.random() * 80);
  return {
    time: 0,
    particles: new ParticleSystem(),
    bgParticles: new ParticleSystem(),
    cloudX: clouds,
    treePositions: trees,
    windTimer: 0,
  };
}

export function updateWorldScene(
  s: WorldSceneState,
  dt: number,
  world: WorldConfig,
  canvasW: number,
  canvasH: number
): WorldSceneState {
  const time = s.time + dt;
  s.particles.update(dt);
  s.bgParticles.update(dt);

  if (world.particleType === "petal" && Math.random() < 0.4) {
    s.bgParticles.emitPetals(canvasW, 1);
  } else if (world.particleType === "rain" && Math.random() < 0.8) {
    s.bgParticles.emitRain(canvasW, 3);
  } else if (world.particleType === "firefly" && Math.random() < 0.1) {
    s.bgParticles.emitFireflies(canvasW, canvasH, 1);
  } else if (world.particleType === "snow" && Math.random() < 0.5) {
    s.bgParticles.emitSnow(canvasW, 2);
  }

  const cloudX = s.cloudX.map(x => {
    const next = x + 18 * dt;
    return next > canvasW * 2 + 120 ? -120 : next;
  });

  return { ...s, time, cloudX };
}

export function drawWorldScene(
  r: Renderer,
  s: WorldSceneState,
  world: WorldConfig,
  player: PlayerState,
  partner: PartnerState,
  obstacles: ObstacleState[],
  hearts: HeartCollectibleState[],
  memCards: MemoryCardState[],
  cam: Camera,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;
  const groundY = world.groundY * canvasH;

  // Sky
  r.drawSkyGradient(world.skyColors, canvasW, canvasH);

  // Background rain overlay (screen-space)
  if (world.hasRain) {
    s.bgParticles.draw(ctx);
  }

  // Clouds (parallax)
  ctx.save();
  ctx.translate(-cam.x * 0.2, 0);
  s.cloudX.forEach((cx, i) => {
    r.drawCloud(cx, 50 + (i % 3) * 35, 80 + (i % 3) * 30,
      world.id === 2 ? "rgba(100,120,160,0.3)" : "rgba(255,255,255,0.5)"
    );
  });
  ctx.restore();

  // World (camera space)
  applyCameraTransform(ctx, cam, canvasW, canvasH);

  // Ground
  r.drawGround(groundY, world.levelWidth, cam.x, world.groundColor, world.groundLineColor, canvasH);

  // Trees
  if (world.id !== 2 && world.id !== 4) {
    s.treePositions.forEach(tx => {
      r.drawTree(tx, groundY, 0.8 + Math.random() * 0.3,
        world.id === 1 ? "#7bc67e" : world.id === 5 ? "#d4a96a" : "#5aab5e"
      );
    });
  }

  // Platforms (world 3)
  if (world.hasPlatforms) {
    PLATFORM_DEFS.forEach(p => {
      r.drawPlatform(p.x, groundY - 90, p.w, world.accentColor);
    });
  }

  // Memory cards
  memCards.forEach(mc => {
    if (!mc.triggered) {
      r.drawMemoryCard(mc.x, mc.y, false, mc.title, s.time);
    }
  });

  // Hearts
  hearts.forEach(h => {
    if (!h.collected || h.collectAnim < 1) {
      r.drawHeartCollectible(h.x, h.y, 12, h.collectAnim);
    }
  });

  // Obstacles
  obstacles.forEach(o => {
    r.drawObstacle(
      o.x, groundY - 60, 44,
      o.symbol, o.label,
      o.flash > 0, o.bobOffset
    );
  });

  // Partner (waiting at end, waves)
  if (partner.visible) {
    drawHer(ctx, partner.x + 18, partner.y, {
      anim: "wave",
      time: s.time,
      facing: partner.facingRight ? "right" : "left",
    });
  }

  // Player
  const animState = !player.onGround
    ? "jump"
    : player.animState === "run" ? "run" : "idle";

  drawHim(ctx, player.x + 18, player.y, {
    anim: animState,
    time: s.time,
    facing: player.facingRight ? "right" : "left",
    slowed: player.speed < 0.9,
  });

  // Foreground particles (petals/snow in world space)
  if (world.particleType !== "rain") {
    s.bgParticles.draw(ctx);
  }

  restoreCamera(ctx);

  // Foreground sparkles (screen space)
  s.particles.draw(ctx);
}
