export interface PartnerState {
  x: number;
  y: number;
  vx: number;
  animState: "idle" | "run" | "hug" | "sit" | "walk";
  animFrame: number;
  animTimer: number;
  visible: boolean;
  facingRight: boolean;
}

export function createPartner(x: number, y: number): PartnerState {
  return {
    x, y, vx: 0,
    animState: "idle",
    animFrame: 0, animTimer: 0,
    visible: false, facingRight: false,
  };
}

export function updatePartner(p: PartnerState, dt: number, targetX?: number): PartnerState {
  let { x, vx, animState, animFrame, animTimer, facingRight } = p;

  if (targetX !== undefined) {
    // Walk toward target
    const dx = targetX - x;
    if (Math.abs(dx) > 4) {
      vx = Math.sign(dx) * 140;
      facingRight = dx > 0;
      animState = "run";
    } else {
      vx = 0;
      animState = "idle";
    }
    x += vx * dt;
  }

  animTimer += dt;
  const fps = animState === "run" ? 10 : 5;
  if (animTimer >= 1 / fps) {
    animTimer = 0;
    animFrame++;
  }

  return { ...p, x, vx, animState, animFrame, animTimer, facingRight };
}