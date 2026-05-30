/**
 * Characters.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for drawing Him and Her across every scene.
 * All sizes are relative to a BASE_H of 72px so they scale uniformly.
 *
 * Public API
 *   drawHim(ctx, x, groundY, opts)
 *   drawHer(ctx, x, groundY, opts)
 *   drawCouple(ctx, cx, groundY, opts)   ← hug / kiss / sit
 */

// ─── Palette ─────────────────────────────────────────────────────────────────

const HIM = {
  hair:       "#1a0e07",
  skin:       "#f5c9a0",
  skinShade:  "#e8a87c",
  shirt:      "#4a8fe8",
  shirtShade: "#2d6cbf",
  pants:      "#1e2d5a",
  shoes:      "#111",
  eye:        "#2a1a0e",
  eyeShine:   "#ffffff",
  blush:      "rgba(255,150,130,0.28)",
};

const HER = {
  hair:       "#2c1508",
  hairHigh:   "#4a2210",
  skin:       "#f5c9a0",
  skinShade:  "#e8a87c",
  dress:      "#ff7eb6",
  dressShade: "#e05a99",
  dressLight: "#ffaad0",
  eye:        "#2a1a0e",
  eyeShine:   "#ffffff",
  blush:      "rgba(255,130,170,0.35)",
  ribbon:     "#ff3a8a",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type HimAnim  = "idle" | "run" | "jump" | "hug" | "kiss" | "sit" | "walk";
export type HerAnim  = "idle" | "wave" | "hug"  | "kiss" | "sit" | "walk";

export interface CharOpts {
  anim?:    HimAnim | HerAnim;
  time?:    number;   // seconds elapsed — drives walk cycle, bob, wave
  scale?:   number;   // default 1
  alpha?:   number;   // default 1
  slowed?:  boolean;  // tints shirt red when hit
  facing?:  "left" | "right";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function s(ctx: CanvasRenderingContext2D, fn: () => void) {
  ctx.save(); fn(); ctx.restore();
}

function pill(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  r: number, color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function circle(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number, color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// ─── HIM ─────────────────────────────────────────────────────────────────────
// Origin: feet at (0, 0).  Total height ≈ 72px.

export function drawHim(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  opts: CharOpts = {}
) {
  const {
    anim   = "idle",
    time   = 0,
    scale  = 1,
    alpha  = 1,
    slowed = false,
    facing = "right",
  } = opts;

  const bob      = (anim === "idle" || anim === "walk") ? Math.sin(time * 3.0) * 1.8 : 0;
  const legSwing = (anim === "run"  || anim === "walk") ? Math.sin(time * 7.5) * 18  : 0;
  const armSwing = (anim === "run"  || anim === "walk") ? Math.sin(time * 7.5 + Math.PI) * 20 : 0;
  const jumpOff  = anim === "jump"  ? -4 : 0;
  const isSit    = anim === "sit";
  const isHug    = anim === "hug" || anim === "kiss";

  s(ctx, () => {
    ctx.globalAlpha *= alpha;
    ctx.translate(x, groundY);
    ctx.scale(scale * (facing === "left" ? -1 : 1), scale);

    // ── Shadow ────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.globalAlpha *= 0.18;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(0, 2, 16 * scale, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const by = bob + jumpOff; // body vertical offset

    // ── Shoes ─────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.translate(-7, by);
        ctx.rotate((legSwing - 4) * Math.PI / 180);
        pill(ctx, -5, -2, 12, 8, 3, HIM.shoes);
      });
      s(ctx, () => {
        ctx.translate(7, by);
        ctx.rotate((-legSwing + 4) * Math.PI / 180);
        pill(ctx, -5, -2, 12, 8, 3, HIM.shoes);
      });
    }

    // ── Legs ──────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.translate(-7, -14 + by);
        ctx.rotate((legSwing) * Math.PI / 180);
        pill(ctx, -4, 0, 9, 17, 3, HIM.pants);
      });
      s(ctx, () => {
        ctx.translate(7, -14 + by);
        ctx.rotate((-legSwing) * Math.PI / 180);
        pill(ctx, -4, 0, 9, 17, 3, HIM.pants);
      });
    } else {
      // Sitting legs dangle forward
      s(ctx, () => {
        ctx.translate(-9, -8);
        ctx.rotate(80 * Math.PI / 180);
        pill(ctx, -4, 0, 9, 22, 3, HIM.pants);
        s(ctx, () => {
          ctx.translate(2, 22);
          pill(ctx, -5, -2, 12, 8, 3, HIM.shoes);
        });
      });
      s(ctx, () => {
        ctx.translate(9, -8);
        ctx.rotate(80 * Math.PI / 180);
        pill(ctx, -4, 0, 9, 22, 3, HIM.pants);
        s(ctx, () => {
          ctx.translate(2, 22);
          pill(ctx, -5, -2, 12, 8, 3, HIM.shoes);
        });
      });
    }

    // ── Body / Shirt ──────────────────────────────────────────────
    const shirtCol = slowed ? "#e05050" : HIM.shirt;
    const shirtShd = slowed ? "#b03030" : HIM.shirtShade;
    pill(ctx, -13, -40 + by, 26, 28, 7, shirtCol);
    // Shading stripe
    s(ctx, () => {
      ctx.globalAlpha *= 0.4;
      pill(ctx, -13, -40 + by, 8, 28, 7, shirtShd);
    });

    // ── Back arm (behind body) ────────────────────────────────────
    if (!isHug && !isSit) {
      s(ctx, () => {
        ctx.translate(-15, -34 + by);
        ctx.rotate((-armSwing - 10) * Math.PI / 180);
        pill(ctx, -4, 0, 9, 16, 4, HIM.skin);
        s(ctx, () => { ctx.translate(0, 16); circle(ctx, 0, 4, 5, HIM.skin); });
      });
    }

    // ── Hug / reach arm ──────────────────────────────────────────
    if (isHug) {
      s(ctx, () => {
        ctx.translate(14, -34 + by);
        ctx.rotate(-70 * Math.PI / 180);
        pill(ctx, -4, 0, 9, 20, 4, HIM.skin);
      });
      s(ctx, () => {
        ctx.translate(-14, -34 + by);
        ctx.rotate(-110 * Math.PI / 180);
        pill(ctx, -4, 0, 9, 20, 4, HIM.skin);
      });
    }

    // ── Front arm ────────────────────────────────────────────────
    if (!isHug && !isSit) {
      s(ctx, () => {
        ctx.translate(15, -34 + by);
        ctx.rotate((armSwing + 10) * Math.PI / 180);
        pill(ctx, -4, 0, 9, 16, 4, HIM.skin);
        s(ctx, () => { ctx.translate(0, 16); circle(ctx, 0, 4, 5, HIM.skin); });
      });
    }

    // ── Neck ──────────────────────────────────────────────────────
    pill(ctx, -4, -44 + by, 8, 7, 3, HIM.skin);

    // ── Head ──────────────────────────────────────────────────────
    const hy = -58 + by;
    // Base
    s(ctx, () => {
      ctx.fillStyle = HIM.skin;
      ctx.beginPath();
      ctx.ellipse(0, hy, 13, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Jaw shade
    s(ctx, () => {
      ctx.globalAlpha *= 0.12;
      ctx.fillStyle = HIM.skinShade;
      ctx.beginPath();
      ctx.ellipse(1, hy + 5, 9, 8, 0, 0, Math.PI);
      ctx.fill();
    });

    // ── Hair ──────────────────────────────────────────────────────
    s(ctx, () => {
      ctx.fillStyle = HIM.hair;
      // Top mass
      ctx.beginPath();
      ctx.ellipse(0, hy - 9, 14, 9, 0, Math.PI, 0);
      ctx.fill();
      // Side tuft left
      ctx.beginPath();
      ctx.ellipse(-12, hy - 4, 4, 7, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // Side tuft right
      ctx.beginPath();
      ctx.ellipse(11, hy - 6, 4, 6, 0.3, 0, Math.PI * 2);
      ctx.fill();
      // Fringe strands
      ctx.fillStyle = HIM.hair;
      [[-4, hy - 2, 2.5, 5], [0, hy - 1, 2, 4.5], [4, hy - 2, 2, 4]].forEach(([fx, fy, fw, fh]) => {
        ctx.beginPath();
        ctx.ellipse(fx, fy, fw, fh, 0.1, 0, Math.PI * 2);
        ctx.fill();
      });
    });

    // ── Eyes ──────────────────────────────────────────────────────
    // Right eye (viewer-right)
    s(ctx, () => {
      // White
      circle(ctx, 5, hy - 1, 4.5, "#fff");
      // Iris
      circle(ctx, 5.5, hy - 0.5, 3, HIM.eye);
      // Pupil shine
      circle(ctx, 6.5, hy - 1.5, 1.2, HIM.eyeShine);
      // Lash top
      ctx.strokeStyle = HIM.hair;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(5, hy - 1, 4.5, Math.PI + 0.2, -0.2);
      ctx.stroke();
    });

    // ── Eyebrow ───────────────────────────────────────────────────
    s(ctx, () => {
      ctx.strokeStyle = HIM.hair;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(2, hy - 6);
      ctx.quadraticCurveTo(5, hy - 8, 9, hy - 6);
      ctx.stroke();
    });

    // ── Mouth ─────────────────────────────────────────────────────
    s(ctx, () => {
      ctx.strokeStyle = HIM.skinShade;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      if (anim === "kiss") {
        // Puckered
        circle(ctx, 2, hy + 7, 3, HIM.skinShade);
      } else {
        // Smile
        ctx.beginPath();
        ctx.arc(2, hy + 5, 5, 0.25, Math.PI - 0.25);
        ctx.stroke();
      }
    });

    // ── Blush ─────────────────────────────────────────────────────
    s(ctx, () => {
      ctx.globalAlpha *= (isHug ? 0.7 : 0.25);
      ctx.fillStyle = HIM.blush;
      ctx.beginPath(); ctx.ellipse(10, hy + 3, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(-10, hy + 3, 5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    });
  });
}

// ─── HER ─────────────────────────────────────────────────────────────────────
// Origin: feet at (0, 0).  Total height ≈ 70px.

export function drawHer(
  ctx: CanvasRenderingContext2D,
  x: number,
  groundY: number,
  opts: CharOpts = {}
) {
  const {
    anim   = "idle",
    time   = 0,
    scale  = 1,
    alpha  = 1,
    facing = "left",
  } = opts;

  const bob      = (anim === "idle" || anim === "walk") ? Math.sin(time * 3.0 + 0.5) * 1.8 : 0;
  const wave     = anim === "wave"  ? Math.sin(time * 4.0) * 25 : 0;
  const legSwing = (anim === "walk") ? Math.sin(time * 7.5) * 14 : 0;
  const isSit    = anim === "sit";
  const isHug    = anim === "hug" || anim === "kiss";

  s(ctx, () => {
    ctx.globalAlpha *= alpha;
    ctx.translate(x, groundY);
    ctx.scale(scale * (facing === "left" ? -1 : 1), scale);

    // ── Shadow ────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.globalAlpha *= 0.18;
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.ellipse(0, 2, 15, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    const by = bob;

    // ── Shoes ─────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.translate(-7, by);
        ctx.rotate((legSwing - 4) * Math.PI / 180);
        // Cute round toe
        pill(ctx, -4, -3, 10, 7, 4, "#cc3377");
      });
      s(ctx, () => {
        ctx.translate(7, by);
        ctx.rotate((-legSwing + 4) * Math.PI / 180);
        pill(ctx, -4, -3, 10, 7, 4, "#cc3377");
      });
    }

    // ── Legs ──────────────────────────────────────────────────────
    if (!isSit) {
      s(ctx, () => {
        ctx.translate(-6, -14 + by);
        ctx.rotate(legSwing * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 16, 3, HER.skin);
      });
      s(ctx, () => {
        ctx.translate(6, -14 + by);
        ctx.rotate(-legSwing * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 16, 3, HER.skin);
      });
    } else {
      // Sitting — legs dangle
      s(ctx, () => {
        ctx.translate(-8, -8);
        ctx.rotate(80 * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 20, 3, HER.skin);
        s(ctx, () => {
          ctx.translate(0, 20);
          pill(ctx, -4, -3, 10, 7, 4, "#cc3377");
        });
      });
      s(ctx, () => {
        ctx.translate(8, -8);
        ctx.rotate(80 * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 20, 3, HER.skin);
        s(ctx, () => {
          ctx.translate(0, 20);
          pill(ctx, -4, -3, 10, 7, 4, "#cc3377");
        });
      });
    }

    // ── Dress body ────────────────────────────────────────────────
    pill(ctx, -11, -38 + by, 22, 26, 6, HER.dress);
    // Dress shading
    s(ctx, () => {
      ctx.globalAlpha *= 0.25;
      pill(ctx, -11, -38 + by, 7, 26, 6, HER.dressShade);
    });

    // ── Skirt flare ───────────────────────────────────────────────
    s(ctx, () => {
      ctx.fillStyle = HER.dress;
      ctx.beginPath();
      ctx.moveTo(-15, -16 + by);
      ctx.bezierCurveTo(-20, -8 + by, -22, 0 + by, -18, 2 + by);
      ctx.lineTo(18, 2 + by);
      ctx.bezierCurveTo(22, 0 + by, 20, -8 + by, 15, -16 + by);
      ctx.closePath();
      ctx.fill();
      // Skirt highlight
      s(ctx, () => {
        ctx.globalAlpha *= 0.3;
        ctx.fillStyle = HER.dressLight;
        ctx.beginPath();
        ctx.moveTo(6, -16 + by);
        ctx.bezierCurveTo(10, -8 + by, 12, 0 + by, 8, 2 + by);
        ctx.lineTo(15, 2 + by);
        ctx.bezierCurveTo(20, 0 + by, 18, -8 + by, 14, -16 + by);
        ctx.closePath();
        ctx.fill();
      });
    });

    // ── Back arm ──────────────────────────────────────────────────
    if (!isHug) {
      s(ctx, () => {
        ctx.translate(-12, -32 + by);
        ctx.rotate(15 * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 14, 4, HER.skin);
        s(ctx, () => { ctx.translate(0.5, 14); circle(ctx, 0, 4, 4, HER.skin); });
      });
    }

    // ── Waving / hug arm ─────────────────────────────────────────
    if (!isHug) {
      s(ctx, () => {
        ctx.translate(12, -32 + by);
        ctx.rotate((-wave - 5) * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 14, 4, HER.skin);
        s(ctx, () => { ctx.translate(0.5, 14); circle(ctx, 0, 4, 4, HER.skin); });
      });
    } else {
      // Both arms stretch out in hug
      s(ctx, () => {
        ctx.translate(12, -34 + by);
        ctx.rotate(-65 * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 20, 4, HER.skin);
      });
      s(ctx, () => {
        ctx.translate(-12, -34 + by);
        ctx.rotate(-115 * Math.PI / 180);
        pill(ctx, -3.5, 0, 8, 20, 4, HER.skin);
      });
    }

    // ── Neck ──────────────────────────────────────────────────────
    pill(ctx, -4, -44 + by, 8, 7, 3, HER.skin);

    // ── Head ──────────────────────────────────────────────────────
    const hy = -58 + by;
    s(ctx, () => {
      ctx.fillStyle = HER.skin;
      ctx.beginPath();
      ctx.ellipse(0, hy, 12, 13, 0, 0, Math.PI * 2);
      ctx.fill();
    });
    // Jaw shade
    s(ctx, () => {
      ctx.globalAlpha *= 0.1;
      ctx.fillStyle = HER.skinShade;
      ctx.beginPath();
      ctx.ellipse(0, hy + 5, 8, 7, 0, 0, Math.PI);
      ctx.fill();
    });

    // ── Hair — long flowing ───────────────────────────────────────
    s(ctx, () => {
      ctx.fillStyle = HER.hair;
      // Top cap
      ctx.beginPath();
      ctx.ellipse(0, hy - 8, 13, 10, 0, Math.PI, 0);
      ctx.fill();
      // Left long flow
      ctx.beginPath();
      ctx.moveTo(-12, hy - 4);
      ctx.bezierCurveTo(-17, hy + 6, -16, hy + 20, -13, hy + 30);
      ctx.lineTo(-8, hy + 30);
      ctx.bezierCurveTo(-10, hy + 18, -11, hy + 6, -9, hy - 2);
      ctx.closePath();
      ctx.fill();
      // Right long flow
      ctx.beginPath();
      ctx.moveTo(12, hy - 4);
      ctx.bezierCurveTo(17, hy + 6, 16, hy + 20, 13, hy + 30);
      ctx.lineTo(8, hy + 30);
      ctx.bezierCurveTo(10, hy + 18, 11, hy + 6, 9, hy - 2);
      ctx.closePath();
      ctx.fill();
      // Hair shine
      s(ctx, () => {
        ctx.globalAlpha *= 0.2;
        ctx.fillStyle = "#8b5e3c";
        ctx.beginPath();
        ctx.ellipse(3, hy - 10, 5, 7, 0.3, Math.PI, 0);
        ctx.fill();
      });
    });

    // ── Ribbon / hair clip ────────────────────────────────────────
    s(ctx, () => {
      ctx.fillStyle = HER.ribbon;
      // Bow left
      ctx.beginPath();
      ctx.moveTo(-14, hy - 8);
      ctx.bezierCurveTo(-18, hy - 14, -20, hy - 6, -14, hy - 4);
      ctx.closePath();
      ctx.fill();
      // Bow right
      ctx.beginPath();
      ctx.moveTo(-8, hy - 8);
      ctx.bezierCurveTo(-4, hy - 14, -2, hy - 6, -8, hy - 4);
      ctx.closePath();
      ctx.fill();
      // Centre knot
      circle(ctx, -11, hy - 7, 3, HER.ribbon);
    });

    // ── Eyes ──────────────────────────────────────────────────────
    // Left eye (viewer-left on her)
    s(ctx, () => {
      circle(ctx, -5, hy - 1, 4.5, "#fff");
      // Iris — bigger for cuteness
      s(ctx, () => {
        ctx.fillStyle = "#6b3a2a";
        ctx.beginPath();
        ctx.ellipse(-5, hy - 0.5, 3.2, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });
      // Pupil
      circle(ctx, -5, hy - 0.5, 2, HER.eye);
      // Shine dots
      circle(ctx, -3.8, hy - 2, 1.3, HER.eyeShine);
      circle(ctx, -6.5, hy - 0.5, 0.7, "rgba(255,255,255,0.6)");
      // Lashes
      ctx.strokeStyle = HER.hair;
      ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.arc(-5, hy - 1, 4.5, Math.PI + 0.1, -0.1); ctx.stroke();
      // Lower lash
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.arc(-5, hy - 1, 4.5, 0.1, Math.PI - 0.1); ctx.stroke();
    });

    // ── Eyebrow ───────────────────────────────────────────────────
    s(ctx, () => {
      ctx.strokeStyle = HER.hair;
      ctx.lineWidth = 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-9, hy - 7);
      ctx.quadraticCurveTo(-5, hy - 9.5, -1, hy - 7.5);
      ctx.stroke();
    });

    // ── Mouth ─────────────────────────────────────────────────────
    s(ctx, () => {
      if (anim === "kiss") {
        ctx.fillStyle = "#d4607a";
        ctx.beginPath();
        ctx.ellipse(-3, hy + 7, 3.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cute smile
        ctx.strokeStyle = "#c0506a";
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(-2, hy + 5, 4.5, 0.3, Math.PI - 0.3);
        ctx.stroke();
        // Dimple
        circle(ctx, -6.5, hy + 7.5, 1, "rgba(200,80,110,0.3)");
      }
    });

    // ── Blush ─────────────────────────────────────────────────────
    s(ctx, () => {
      ctx.globalAlpha *= (isHug ? 0.8 : 0.35);
      ctx.fillStyle = HER.blush;
      ctx.beginPath(); ctx.ellipse(-9.5, hy + 4, 5.5, 3.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(7, hy + 4, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
    });
  });
}

// ─── COUPLE (hug / kiss / sit together) ──────────────────────────────────────

export interface CoupleOpts {
  anim:    "hug" | "kiss" | "sit";
  time?:   number;
  scale?:  number;
  alpha?:  number;
}

export function drawCouple(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  groundY: number,
  opts: CoupleOpts
) {
  const { anim, time = 0, scale = 1, alpha = 1 } = opts;

  // How close they stand
  const gap = anim === "kiss" ? 18 : anim === "sit" ? 20 : 26;

  drawHim(ctx, centerX - gap, groundY, {
    anim: anim as HimAnim,
    time,
    scale,
    alpha,
    facing: "right",
  });

  drawHer(ctx, centerX + gap, groundY, {
    anim: anim as HerAnim,
    time,
    scale,
    alpha,
    facing: "left",
  });

  // Extra heart above during kiss
  if (anim === "kiss") {
    const pulse = 1 + 0.15 * Math.sin(time * 6);
    s(ctx, () => {
      ctx.globalAlpha *= alpha * (0.6 + 0.4 * Math.sin(time * 4));
      ctx.scale(pulse, pulse);
      ctx.fillStyle = "#ff4488";
      ctx.font = "20px serif";
      ctx.textAlign = "center";
      ctx.fillText("♡", centerX / pulse, (groundY - 90) / pulse);
    });
  }
}
