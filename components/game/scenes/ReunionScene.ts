import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import type { WorldConfig } from "@/config/worlds";
import { drawHim, drawHer, drawCouple } from "../entities/Characters";

export interface ReunionSceneState {
  time: number;
  particles: ParticleSystem;
  phase: "approach" | "slowdown" | "meet" | "hug" | "kiss" | "done";
  playerX: number;
  partnerX: number;
  hugProgress: number;
  textAlpha: number;
  doneTimer: number;
}

export function createReunionScene(canvasW: number): ReunionSceneState {
  return {
    time: 0,
    particles: new ParticleSystem(),
    phase: "approach",
    playerX: 80,
    partnerX: canvasW - 100,
    hugProgress: 0,
    textAlpha: 0,
    doneTimer: 0,
  };
}

export function updateReunionScene(
  s: ReunionSceneState,
  dt: number,
  canvasW: number,
  canvasH: number,
  onDone: () => void
): ReunionSceneState {
  const time = s.time + dt;
  let { phase, playerX, partnerX, hugProgress, textAlpha, doneTimer } = s;
  const midX = canvasW / 2;

  if (phase === "approach") {
    playerX  = Math.min(midX - 70, playerX  + 160 * dt);
    partnerX = Math.max(midX + 20,  partnerX - 140 * dt);
    if (playerX >= midX - 70) phase = "slowdown";
  } else if (phase === "slowdown") {
    playerX  = Math.min(midX - 45, playerX  + 60 * dt);
    partnerX = Math.max(midX + 5,   partnerX - 50 * dt);
    if (playerX >= midX - 45) phase = "meet";
  } else if (phase === "meet") {
    if (time > 0.8) {
      phase = "hug";
      s.particles.emitHeartBurst(midX, canvasH * 0.4, 20);
      s.particles.emitSparkles(midX, canvasH * 0.4, 25);
    }
  } else if (phase === "hug") {
    hugProgress = Math.min(1, hugProgress + dt * 1.2);
    textAlpha   = Math.min(1, textAlpha + dt * 1.5);
    if (time > 2.5) {
      s.particles.emitHeartBurst(midX, canvasH * 0.35, 6);
      if (time > 3.5) phase = "kiss";
    }
  } else if (phase === "kiss") {
    textAlpha = Math.min(1, textAlpha + dt);
    doneTimer += dt;
    if (doneTimer > 2.5) onDone();
  }

  s.particles.update(dt);
  return { ...s, time, phase, playerX, partnerX, hugProgress, textAlpha, doneTimer };
}

export function drawReunionScene(
  r: Renderer,
  s: ReunionSceneState,
  world: WorldConfig,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;
  const groundY = world.groundY * canvasH;

  // Background
  r.drawSkyGradient(world.skyColors, canvasW, canvasH);
  r.drawGround(groundY, canvasW * 3, 0, world.groundColor, world.groundLineColor, canvasH);

  const midX = canvasW / 2;
  const isHugOrKiss = s.phase === "hug" || s.phase === "kiss";

  // Warm radial glow when they meet
  if (isHugOrKiss) {
    ctx.save();
    const glow = ctx.createRadialGradient(midX, groundY - 50, 0, midX, groundY - 50, 180);
    glow.addColorStop(0, `rgba(255,126,182,${0.35 * s.hugProgress})`);
    glow.addColorStop(0.5, `rgba(255,180,220,${0.12 * s.hugProgress})`);
    glow.addColorStop(1, "rgba(255,126,182,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, canvasW, canvasH);
    ctx.restore();
  }

  // Draw characters — separate approach, then couple for hug/kiss
  if (isHugOrKiss) {
    drawCouple(ctx, midX, groundY, {
      anim: s.phase === "kiss" ? "kiss" : "hug",
      time: s.time,
    });
  } else {
    drawHim(ctx, s.playerX, groundY, {
      anim: s.phase === "meet" ? "idle" : "run",
      time: s.time,
      facing: "right",
    });
    drawHer(ctx, s.partnerX, groundY, {
      anim: "wave",
      time: s.time,
      facing: "left",
    });
  }

  // Particles
  s.particles.draw(ctx);

  // Cinematic text
  if (isHugOrKiss && s.textAlpha > 0) {
    const msg = s.phase === "kiss" ? "Together at last ♡" : "Finally...";
    r.drawPixelText(msg, midX, canvasH * 0.2, 10, "#ff7eb6", "center", s.textAlpha);
  }
}
