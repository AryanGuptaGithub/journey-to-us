import { Renderer } from "../engine/Renderer";
import { ParticleSystem } from "../engine/ParticleSystem";

interface TitleSceneState {
  time: number;
  clouds: Array<{ x: number; y: number; w: number; speed: number }>;
  particles: ParticleSystem;
  titleScale: number;
  titlePhase: number;
}

export function createTitleScene(canvasW: number, canvasH: number): TitleSceneState {
  const particles = new ParticleSystem();
  const clouds = Array.from({ length: 6 }, (_, i) => ({
    x: (i / 6) * canvasW + Math.random() * 200,
    y: 60 + Math.random() * canvasH * 0.35,
    w: 60 + Math.random() * 80,
    speed: 15 + Math.random() * 10,
  }));
  return { time: 0, clouds, particles, titleScale: 0, titlePhase: 0 };
}

export function updateTitleScene(s: TitleSceneState, dt: number, canvasW: number, canvasH: number): TitleSceneState {
  const time = s.time + dt;
  // Clouds wrap
  const clouds = s.clouds.map(c => ({
    ...c,
    x: c.x + c.speed * dt > canvasW + 100 ? -120 : c.x + c.speed * dt,
  }));
  // Emit petals
  if (Math.random() < 0.3) s.particles.emitPetals(canvasW, 1);
  // Heart burst every 2s
  if (Math.floor(time * 0.5) > Math.floor(s.time * 0.5)) {
    s.particles.emitHeartBurst(
      100 + Math.random() * (canvasW - 200),
      canvasH * 0.2 + Math.random() * canvasH * 0.3,
      4
    );
  }
  s.particles.update(dt);

  // Title bounce-in
  const titleScale = Math.min(1, s.titleScale + dt * 3);
  return { ...s, time, clouds, titleScale };
}

export function drawTitleScene(
  r: Renderer,
  s: TitleSceneState,
  canvasW: number,
  canvasH: number
) {
  const ctx = r.ctx;
  // Sky gradient: deep romance purple → warm pink
  r.drawSkyGradient(["#1a0a2e", "#6b2060"], canvasW, canvasH);

  // Stars
  ctx.save();
  for (let i = 0; i < 60; i++) {
    const sx = ((i * 137.5) % 1) * canvasW;
    const sy = ((i * 97.3) % 0.6) * canvasH;
    const twinkle = 0.4 + 0.6 * Math.sin(s.time * 2 + i);
    ctx.globalAlpha = twinkle * 0.8;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Clouds
  s.clouds.forEach(c => r.drawCloud(c.x, c.y, c.w, "rgba(255,200,220,0.25)"));

  // Ground silhouette
  ctx.fillStyle = "#0d0518";
  ctx.beginPath();
  ctx.moveTo(0, canvasH * 0.82);
  for (let x = 0; x <= canvasW; x += 30) {
    const h = Math.sin(x * 0.02 + s.time * 0.3) * 12 + Math.sin(x * 0.05) * 8;
    ctx.lineTo(x, canvasH * 0.82 + h);
  }
  ctx.lineTo(canvasW, canvasH);
  ctx.lineTo(0, canvasH);
  ctx.closePath();
  ctx.fill();

  // Particles
  s.particles.draw(ctx);

  // Title — bounce in
  ctx.save();
  const cy = canvasH * 0.32;
  ctx.translate(canvasW / 2, cy);
  ctx.scale(s.titleScale, s.titleScale);
  ctx.translate(-canvasW / 2, -cy);

  // Glow behind title
  const glowPulse = 0.6 + 0.4 * Math.sin(s.time * 1.5);
  ctx.shadowColor = "#ff7eb6";
  ctx.shadowBlur = 20 * glowPulse;
  r.drawPixelText("THE JOURNEY", canvasW / 2, canvasH * 0.28, 18, "#ff7eb6", "center");
  r.drawPixelText("TO US", canvasW / 2, canvasH * 0.38, 18, "#ffb997", "center");

  // Heart between words
  ctx.shadowBlur = 0;
  const heartPulse = 1 + 0.15 * Math.sin(s.time * 3);
  ctx.save();
  ctx.translate(canvasW / 2, canvasH * 0.455);
  ctx.scale(heartPulse, heartPulse);
  r.drawHeart(0, -10, 14, "#ff7eb6");
  ctx.restore();
  ctx.restore();

  // Subtitle
  const subAlpha = Math.min(1, Math.max(0, (s.time - 0.8) * 1.5));
  ctx.globalAlpha = subAlpha;
  r.drawPixelText(
    "No matter how far apart we are...",
    canvasW / 2, canvasH * 0.56, 7, "#ffd5ee", "center"
  );
  r.drawPixelText(
    "I'll always run toward you.",
    canvasW / 2, canvasH * 0.62, 7, "#ffd5ee", "center"
  );
  ctx.globalAlpha = 1;
}