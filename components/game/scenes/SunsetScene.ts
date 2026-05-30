import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import { STORY_CONFIG } from "@/config/story";
import { drawHim, drawHer } from "../entities/Characters";

export interface SunsetSceneState {
  time: number;
  particles: ParticleSystem;
  memoryAlpha: number[];
  memoryTimer: number;
  currentMemory: number;
  playerX: number;
  partnerX: number;
  waveOffset: number;
  doneTimer: number;
  doneAlpha: number;
}

export function createSunsetScene(canvasW: number): SunsetSceneState {
  const memCount = STORY_CONFIG.sunsetMemories.length;
  return {
    time: 0,
    particles: new ParticleSystem(),
    memoryAlpha: new Array(memCount).fill(0),
    memoryTimer: 0,
    currentMemory: 0,
    playerX: canvasW * 0.38,
    partnerX: canvasW * 0.52,
    waveOffset: 0,
    doneTimer: 0,
    doneAlpha: 0,
  };
}

export function updateSunsetScene(
  s: SunsetSceneState,
  dt: number,
  canvasW: number,
  canvasH: number,
  onDone: () => void
): SunsetSceneState {
  const time = s.time + dt;
  const waveOffset = s.waveOffset + dt * 60;

  // Cycle through memories
  let { memoryTimer, currentMemory, memoryAlpha, doneTimer, doneAlpha } = s;
  const alphas = [...memoryAlpha];
  memoryTimer += dt;

  if (currentMemory < STORY_CONFIG.sunsetMemories.length) {
    alphas[currentMemory] = Math.min(1, alphas[currentMemory] + dt * 1.5);
    if (memoryTimer > 1.8) {
      memoryTimer = 0;
      currentMemory = Math.min(currentMemory + 1, STORY_CONFIG.sunsetMemories.length);
    }
  } else {
    doneTimer += dt;
    doneAlpha = Math.min(1, doneAlpha + dt);
    if (doneTimer > 2.5) onDone();
  }

  // Emit hearts gently
  if (Math.random() < 0.15) {
    s.particles.emitHeartBurst(
      s.playerX + 30 + Math.random() * 60, canvasH * 0.55, 3
    );
  }
  s.particles.update(dt);

  return { ...s, time, waveOffset, memoryAlpha: alphas, memoryTimer, currentMemory, doneTimer, doneAlpha };
}

export function drawSunsetScene(
  r: Renderer,
  s: SunsetSceneState,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;

  // Sunset sky
  r.drawSkyGradient(["#ff6b35", "#ffb347", "#ffd5a8"], canvasW, canvasH);

  const groundY = canvasH * 0.72;

  // Sun
  const sunGrad = ctx.createRadialGradient(canvasW * 0.5, groundY - 10, 0, canvasW * 0.5, groundY - 10, 70);
  sunGrad.addColorStop(0, "#fff7e0");
  sunGrad.addColorStop(0.4, "#ffcc44");
  sunGrad.addColorStop(1, "rgba(255,160,0,0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(canvasW * 0.5, groundY - 10, 70, 0, Math.PI * 2);
  ctx.fill();

  // Reflection
  for (let i = 0; i < 5; i++) {
    const rx = canvasW * 0.5 - 12 + i * 6;
    const ry = groundY + 10 + i * 8;
    ctx.globalAlpha = 0.25 - i * 0.04;
    ctx.fillStyle = "#ffcc44";
    ctx.beginPath();
    ctx.ellipse(rx, ry, 6 - i, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Beach / water
  ctx.fillStyle = "#a8d8ea";
  ctx.fillRect(0, groundY, canvasW, canvasH - groundY);

  // Waves
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 2;
  for (let w = 0; w < 3; w++) {
    ctx.beginPath();
    for (let x = 0; x <= canvasW; x += 10) {
      const y = groundY + w * 12 + Math.sin((x + s.waveOffset + w * 40) * 0.04) * 4;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Sand
  ctx.fillStyle = "#f9d89c";
  ctx.fillRect(0, groundY - 12, canvasW, 24);
  ctx.strokeStyle = "#e8c070"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, groundY - 12); ctx.lineTo(canvasW, groundY - 12); ctx.stroke();

  // Characters sitting
  drawHim(ctx, s.playerX, groundY, { anim: "sit", time: s.time, facing: "right" });
  drawHer(ctx, s.partnerX, groundY, { anim: "sit", time: s.time, facing: "left" });

  // Particles
  s.particles.draw(ctx);

  // Memory list
  STORY_CONFIG.sunsetMemories.forEach((mem, i) => {
    const a = s.memoryAlpha[i] || 0;
    if (a <= 0) return;
    r.drawPixelText(
      `♡ ${mem}`,
      canvasW * 0.1,
      canvasH * 0.1 + i * 28,
      6, "#fff3e0", "left", a
    );
  });

  // Final message
  if (s.doneAlpha > 0) {
    r.drawPixelText(
      "The journey was always worth it.",
      canvasW / 2, canvasH * 0.88,
      7, "#ff7eb6", "center", s.doneAlpha
    );
  }
}

