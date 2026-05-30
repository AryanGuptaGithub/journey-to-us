import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import type { WorldConfig } from "@/config/worlds";
import { drawHim, drawHer } from "../entities/Characters";

export interface WalkingSceneState {
  time: number;
  particles: ParticleSystem;
  playerX: number;
  partnerX: number;
  doneTimer: number;
  textAlpha: number;
  textIndex: number;
  textTimer: number;
}

const MESSAGES = [
  "Side by side now ♡",
  "Every step together.",
  "Ready for the next chapter?",
];

export function createWalkingScene(canvasW: number): WalkingSceneState {
  return {
    time: 0,
    particles: new ParticleSystem(),
    playerX: canvasW * 0.3,
    partnerX: canvasW * 0.46,
    doneTimer: 0,
    textAlpha: 0,
    textIndex: 0,
    textTimer: 0,
  };
}

export function updateWalkingScene(
  s: WalkingSceneState,
  dt: number,
  canvasW: number,
  canvasH: number,
  onDone: () => void
): WalkingSceneState {
  const time = s.time + dt;
  const playerX  = s.playerX  + 55 * dt;
  const partnerX = s.partnerX + 55 * dt;

  if (Math.random() < 0.2) {
    s.particles.emitHeartBurst((playerX + partnerX) / 2, canvasH * 0.55, 2);
  }
  if (Math.random() < 0.3) {
    s.particles.emitSparkles(playerX + Math.random() * 80, canvasH * 0.6, 1);
  }
  s.particles.update(dt);

  let { textAlpha, textIndex, textTimer, doneTimer } = s;
  textTimer += dt;
  if (textTimer > 1.8 && textIndex < MESSAGES.length - 1) {
    textIndex++;
    textTimer = 0;
    textAlpha = 0;
  }
  textAlpha = Math.min(1, textAlpha + dt * 2);
  doneTimer += dt;
  if (doneTimer > 4.5) onDone();

  return { ...s, time, playerX, partnerX, textAlpha, textIndex, textTimer, doneTimer };
}

export function drawWalkingScene(
  r: Renderer,
  s: WalkingSceneState,
  world: WorldConfig,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;
  const groundY = world.groundY * canvasH;

  r.drawSkyGradient(world.skyColors, canvasW, canvasH);
  r.drawGround(groundY, canvasW * 3, 0, world.groundColor, world.groundLineColor, canvasH);

  s.particles.draw(ctx);

  // Draw both walking side by side, him slightly behind her
  drawHim(ctx, s.playerX, groundY, {
    anim: "walk",
    time: s.time,
    facing: "right",
  });
  drawHer(ctx, s.partnerX, groundY, {
    anim: "walk",
    time: s.time + 0.3, // slight phase offset so they don't step in sync
    facing: "right",
  });

  // Floating message
  r.drawPixelText(
    MESSAGES[s.textIndex],
    canvasW / 2, canvasH * 0.2,
    7, "#ff7eb6", "center", s.textAlpha
  );
}
