import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";
import { STORY_CONFIG } from "@/config/story";

export interface EndCreditsState {
  time: number;
  particles: ParticleSystem;
  lineAlphas: number[];
  lineTimer: number;
  currentLine: number;
  restartAlpha: number;
}

export function createEndCredits(): EndCreditsState {
  return {
    time: 0,
    particles: new ParticleSystem(),
    lineAlphas: new Array(STORY_CONFIG.endCredits.length).fill(0),
    lineTimer: 0,
    currentLine: 0,
    restartAlpha: 0,
  };
}

export function updateEndCredits(
  s: EndCreditsState,
  dt: number,
  canvasW: number,
  canvasH: number
): EndCreditsState {
  const time = s.time + dt;
  let { lineTimer, currentLine, restartAlpha } = s;
  const alphas = [...s.lineAlphas];

  lineTimer += dt;

  if (currentLine < STORY_CONFIG.endCredits.length) {
    alphas[currentLine] = Math.min(1, alphas[currentLine] + dt * 1.2);
    if (lineTimer > 1.5) {
      lineTimer = 0;
      currentLine++;
    }
  } else {
    restartAlpha = Math.min(1, restartAlpha + dt * 0.8);
  }

  if (Math.random() < 0.4) {
    s.particles.emitHeartBurst(
      Math.random() * canvasW,
      Math.random() * canvasH * 0.8,
      3
    );
  }
  s.particles.update(dt);

  return { ...s, time, lineAlphas: alphas, lineTimer, currentLine, restartAlpha };
}

export function drawEndCredits(
  r: Renderer,
  s: EndCreditsState,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;

  // Deep romantic bg
  r.drawSkyGradient(["#0a0418", "#2d0a4e", "#6b1060"], canvasW, canvasH);

  // Stars
  ctx.save();
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 137.5) % 1) * canvasW;
    const sy = ((i * 97.3) % 0.7) * canvasH;
    const twinkle = 0.3 + 0.7 * Math.sin(s.time * 1.5 + i);
    ctx.globalAlpha = twinkle * 0.7;
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(sx, sy, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();

  // Credits lines
  const startY = canvasH * 0.18;
  STORY_CONFIG.endCredits.forEach((line, i) => {
    const a = s.lineAlphas[i] || 0;
    if (a <= 0) return;
    const y = startY + i * 46;
    const isHeart = line === "♡" || line === "—";
    const size = isHeart ? 14 : (i === 0 ? 9 : 7);
    const color = i === 1 ? "#ff7eb6" : i === 0 ? "#ffd5ee" : "#ffb5d8";
    r.drawPixelText(line, canvasW / 2, y, size, color, "center", a);
  });

  // Floating hearts
  s.particles.draw(ctx);

  // Restart prompt
  if (s.restartAlpha > 0) {
    const blink = 0.5 + 0.5 * Math.sin(s.time * 2.5);
    r.drawPixelText(
      "Press any key to play again",
      canvasW / 2, canvasH * 0.92,
      6, "#ffd5ee", "center", s.restartAlpha * blink
    );
  }
}