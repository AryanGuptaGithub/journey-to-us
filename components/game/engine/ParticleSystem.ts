export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;    // 0→1 countdown
  maxLife: number;
  size: number;
  color: string;
  type: "heart" | "sparkle" | "petal" | "rain" | "firefly" | "snow" | "text";
  rotation?: number;
  rotSpeed?: number;
  text?: string;
  alpha?: number;
}

export class ParticleSystem {
  particles: Particle[] = [];

  update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.rotation !== undefined && p.rotSpeed) {
        p.rotation += p.rotSpeed * dt;
      }
      // gravity for most types
      if (p.type === "heart" || p.type === "sparkle") {
        p.vy -= 40 * dt; // float up
      }
      if (p.type === "petal") {
        p.vx += Math.sin(p.life * 3) * 10 * dt;
        p.vy += 15 * dt;
      }
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const t = p.life / p.maxLife;
      const alpha = p.type === "rain" ? 0.4 : t;
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === "heart") {
        this.drawHeart(ctx, p.x, p.y, p.size, p.color);
      } else if (p.type === "sparkle") {
        this.drawSparkle(ctx, p.x, p.y, p.size * t, p.color);
      } else if (p.type === "petal") {
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation || 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "rain") {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 0.05, p.y + p.vy * 0.05);
        ctx.stroke();
      } else if (p.type === "firefly") {
        const pulse = 0.5 + 0.5 * Math.sin(Date.now() * 0.003 + p.x);
        ctx.globalAlpha = alpha * pulse;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "snow") {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === "text" && p.text) {
        ctx.font = `8px 'Press Start 2P', monospace`;
        ctx.fillStyle = p.color;
        ctx.textAlign = "center";
        ctx.fillText(p.text, p.x, p.y);
      }

      ctx.restore();
    }
  }

  private drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, color: string) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + s * 0.5);
    ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s * 0.5);
    ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.5, x, y + s * 2);
    ctx.bezierCurveTo(x, y + s * 1.5, x + s, y + s, x + s, y + s * 0.5);
    ctx.bezierCurveTo(x + s, y, x, y, x, y + s * 0.5);
    ctx.fill();
  }

  private drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.stroke();
  }

  // Emitters
  emitHeartBurst(x: number, y: number, count = 12) {
    const colors = ["#ff7eb6", "#ffb997", "#ffffff", "#cdb4db"];
    for (let i = 0; i < count; i++) {
      const a = (Math.random() * Math.PI * 2);
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 50,
        life: 1.2 + Math.random() * 0.4,
        maxLife: 1.6,
        size: 4 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: "heart",
      });
    }
  }

  emitSparkles(x: number, y: number, count = 20) {
    const colors = ["#fff", "#ffff88", "#ff7eb6", "#a2d2ff"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 100;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed,
        life: 0.8 + Math.random() * 0.6,
        maxLife: 1.4,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: "sparkle",
      });
    }
  }

  emitPetals(canvasW: number, count = 3) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvasW,
        y: -10,
        vx: (Math.random() - 0.5) * 30,
        vy: 20 + Math.random() * 30,
        life: 5 + Math.random() * 3,
        maxLife: 8,
        size: 3 + Math.random() * 4,
        color: `hsl(${330 + Math.random() * 20}, 80%, ${70 + Math.random() * 15}%)`,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 2,
        type: "petal",
      });
    }
  }

  emitRain(canvasW: number, count = 4) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvasW,
        y: -10,
        vx: -20,
        vy: 400 + Math.random() * 200,
        life: 0.6,
        maxLife: 0.6,
        size: 1,
        color: "#88aacc",
        type: "rain",
      });
    }
  }

  emitFireflies(canvasW: number, canvasH: number, count = 1) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvasW,
        y: canvasH * 0.3 + Math.random() * canvasH * 0.4,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 10,
        life: 4 + Math.random() * 3,
        maxLife: 7,
        size: 2 + Math.random() * 2,
        color: "#ffffaa",
        type: "firefly",
      });
    }
  }

  emitSnow(canvasW: number, count = 2) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * canvasW,
        y: -5,
        vx: (Math.random() - 0.5) * 20,
        vy: 30 + Math.random() * 40,
        life: 4 + Math.random() * 3,
        maxLife: 7,
        size: 1 + Math.random() * 2,
        color: "rgba(220,235,255,0.8)",
        type: "snow",
      });
    }
  }

  clear() {
    this.particles = [];
  }
}