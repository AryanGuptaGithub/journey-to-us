import type { Camera } from "./gameReducer";

export function updateCamera(cam: Camera, dt: number): Camera {
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  const lerpSpeed = 6 * dt; // smooth follow

  return {
    ...cam,
    x: lerp(cam.x, cam.targetX, lerpSpeed),
    y: lerp(cam.y, cam.targetY, lerpSpeed),
    scale: lerp(cam.scale, cam.targetScale, lerpSpeed * 0.5),
    shake: cam.shake * cam.shakeDecay,
  };
}

export function applyCameraTransform(
  ctx: CanvasRenderingContext2D,
  cam: Camera,
  canvasW: number,
  canvasH: number
) {
  const shakeX = (Math.random() - 0.5) * cam.shake * 2;
  const shakeY = (Math.random() - 0.5) * cam.shake * 2;

  ctx.save();
  ctx.translate(canvasW / 2 + shakeX, canvasH / 2 + shakeY);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-canvasW / 2 - cam.x, -canvasH / 2 - cam.y);
}

export function restoreCamera(ctx: CanvasRenderingContext2D) {
  ctx.restore();
}