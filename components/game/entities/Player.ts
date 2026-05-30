import type { InputState } from "../engine/useInput";

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  facingRight: boolean;
  animState: "idle" | "run" | "jump" | "hug" | "sit" | "walk";
  animFrame: number;
  animTimer: number;
  speed: number; // multiplier (1 = normal)
  speedTimer: number; // countdown to restore speed
  invincible: number; // countdown ms
  scale: number;
}

const GRAVITY = 900;
const JUMP_FORCE = -460;
const RUN_SPEED = 190;
const FRICTION = 0.80;

export function createPlayer(x: number, groundY: number): PlayerState {
  return {
    x, y: groundY, vx: 0, vy: 0,
    onGround: true, facingRight: true,
    animState: "idle", animFrame: 0, animTimer: 0,
    speed: 1, speedTimer: 0, invincible: 0, scale: 1,
  };
}

export function updatePlayer(
  p: PlayerState,
  input: InputState,
  dt: number,
  groundY: number,
  worldWidth: number,
  isWindWorld: boolean
): PlayerState {
  let { x, y, vx, vy, onGround, facingRight, animState, animFrame, animTimer,
        speed, speedTimer, invincible, scale } = p;

  // Restore speed
  if (speedTimer > 0) {
    speedTimer -= dt;
    if (speedTimer <= 0) speed = 1;
  }

  if (invincible > 0) invincible -= dt;

  // Effective speed
  const effectiveSpeed = RUN_SPEED * speed;

  // Horizontal
  const left  = input.left  || input.joystickX < -0.3;
  const right = input.right || input.joystickX >  0.3;

  if (left)  { vx = -effectiveSpeed; facingRight = false; }
  if (right) { vx =  effectiveSpeed; facingRight = true; }
  if (!left && !right) vx *= FRICTION;

  // Wind pushback (World 4)
  if (isWindWorld) vx -= 40 * dt;

  // Jump
  if ((input.jumpJustPressed || input.joystickY < -0.5) && onGround) {
    vy = JUMP_FORCE;
    onGround = false;
  }

  // Gravity
  vy += GRAVITY * dt;
  vy = Math.min(vy, 800);

  // Integrate
  x += vx * dt;
  y += vy * dt;

  // Ground collision
  if (y >= groundY) {
    y = groundY;
    vy = 0;
    onGround = true;
  }

  // World bounds
  x = Math.max(0, Math.min(worldWidth - 1, x));

  // Animation
  animTimer += dt;
  const fps = animState === "run" ? 10 : 6;
  if (animTimer >= 1 / fps) {
    animTimer = 0;
    animFrame++;
  }

  if (!onGround) animState = "jump";
  else if (Math.abs(vx) > 10) animState = "run";
  else animState = "idle";

  return { x, y, vx, vy, onGround, facingRight, animState, animFrame, animTimer,
           speed, speedTimer, invincible, scale };
}

export function applySlowdown(p: PlayerState, amount: number): PlayerState {
  return {
    ...p,
    speed: Math.max(0.2, p.speed * (1 - amount)),
    speedTimer: 2.5, // restore after 2.5s
    invincible: 1.5,
  };
}