import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import type { WorldConfig } from "@/config/worlds";

export interface ChapterCardState {
  time: number;
  particles: ParticleSystem;
  phase: "enter" | "hold" | "exit";
  alpha: number;
}

export function createChapterCard(): ChapterCardState {
  return {
    time: 0,
    particles: new ParticleSystem(),
    phase: "enter",
    alpha: 0,
  };
}

export function updateChapterCard(
  s: ChapterCardState,
  dt: number,
  canvasW: number,
  canvasH: number,
  onDone: () => void
): ChapterCardState {
  const time = s.time + dt;
  let { phase, alpha } = s;

  if (phase === "enter") {
    alpha = Math.min(1, alpha + dt * 2.5);
    if (alpha >= 1 && time > 0.5) phase = "hold";
  } else if (phase === "hold") {
    if (time > 2.8) phase = "exit";
  } else {
    alpha = Math.max(0, alpha - dt * 2.5);
    if (alpha <= 0) onDone();
  }

  if (Math.random() < 0.3) s.particles.emitSparkles(
    Math.random() * canvasW, Math.random() * canvasH * 0.5, 1
  );
  s.particles.update(dt);

  return { ...s, time, phase, alpha };
}

export function drawChapterCard(
  r: Renderer,
  s: ChapterCardState,
  world: WorldConfig,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;
  ctx.save();
  ctx.globalAlpha = s.alpha;

  // Background
  r.drawSkyGradient(world.skyColors, canvasW, canvasH);

  // Decorative lines
  ctx.strokeStyle = world.accentColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = s.alpha * 0.3;
  for (let i = 0; i < 5; i++) {
    const y = canvasH * (0.2 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(canvasW * 0.1, y);
    ctx.lineTo(canvasW * 0.9, y);
    ctx.stroke();
  }
  ctx.globalAlpha = s.alpha;

  // Card
  const cardW = Math.min(500, canvasW * 0.8);
  const cardH = 160;
  const cx = canvasW / 2;
  const cy = canvasH / 2;
  r.drawRoundRect(
    cx - cardW / 2, cy - cardH / 2,
    cardW, cardH, 16,
    "rgba(0,0,0,0.55)", world.accentColor, 2
  );

  // Chapter label
  r.drawPixelText(world.chapterTitle, cx, cy - 40, 10, world.accentColor, "center");

  // Divider
  ctx.strokeStyle = world.accentColor;
  ctx.lineWidth = 1;
  ctx.globalAlpha = s.alpha * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx - cardW * 0.35, cy - 18);
  ctx.lineTo(cx + cardW * 0.35, cy - 18);
  ctx.stroke();
  ctx.globalAlpha = s.alpha;

  // World name
  r.drawPixelText(world.name, cx, cy + 10, 14, "#fff", "center");

  // Subtitle
  r.drawPixelText(world.chapterSubtitle || "", cx, cy + 48, 6, "#ffd5ee", "center");

  // Particles
  s.particles.draw(ctx);

  ctx.restore();
}