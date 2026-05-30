/**
 * Renderer – canvas drawing utility class.
 * All scenes receive an instance and call methods on it.
 */
export class Renderer {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;

  constructor(ctx: CanvasRenderingContext2D, w: number, h: number) {
    this.ctx = ctx;
    this.width = w;
    this.height = h;
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  clear(color = "#000") {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawSkyGradient(colors: string[], w = this.width, h = this.height) {
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    colors.forEach((c, i) => grad.addColorStop(i / (colors.length - 1), c));
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);
  }

  drawCloud(x: number, y: number, w: number, color = "rgba(255,255,255,0.6)") {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    const r = w * 0.18;
    ctx.beginPath();
    ctx.arc(x, y, r * 1.1, 0, Math.PI * 2);
    ctx.arc(x + w * 0.22, y - r * 0.5, r * 0.9, 0, Math.PI * 2);
    ctx.arc(x + w * 0.45, y - r * 0.3, r * 1.2, 0, Math.PI * 2);
    ctx.arc(x + w * 0.68, y - r * 0.5, r * 0.85, 0, Math.PI * 2);
    ctx.arc(x + w * 0.88, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawHeart(cx: number, cy: number, size: number, color: string, alpha = 1) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.translate(cx, cy);
    ctx.scale(size / 10, size / 10);
    ctx.moveTo(0, -3);
    ctx.bezierCurveTo(0, -6, -5, -8, -7, -5);
    ctx.bezierCurveTo(-10, -2, -8, 3, 0, 7);
    ctx.bezierCurveTo(8, 3, 10, -2, 7, -5);
    ctx.bezierCurveTo(5, -8, 0, -6, 0, -3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawPixelText(
    text: string,
    x: number,
    y: number,
    size: number,
    color: string,
    align: CanvasTextAlign = "left",
    alpha = 1
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.font = `${size}px 'Press Start 2P', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawRoundRect(
    x: number, y: number, w: number, h: number,
    r: number, fill?: string, stroke?: string, lineWidth = 2
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lineWidth; ctx.stroke(); }
    ctx.restore();
  }

  drawGround(
    groundY: number, levelWidth: number, camX: number,
    groundColor: string, lineColor: string, canvasH: number
  ) {
    const ctx = this.ctx;
    ctx.fillStyle = groundColor;
    ctx.fillRect(camX - 10, groundY, levelWidth + 200, canvasH - groundY + 10);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(camX - 10, groundY);
    ctx.lineTo(camX + levelWidth + 200, groundY);
    ctx.stroke();
  }

  drawObstacle(
    x: number, y: number, size: number,
    symbol: string, label: string,
    flash: boolean, bobOffset: number
  ) {
    const ctx = this.ctx;
    const drawY = y + bobOffset;
    ctx.save();

    // Shadow
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.ellipse(x + size / 2, y + size + 4, size * 0.4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Box
    const bg = flash ? "rgba(255,100,100,0.9)" : "rgba(30,20,60,0.85)";
    this.drawRoundRect(x, drawY, size, size, 8, bg, flash ? "#ff4444" : "#ff7eb6", 2);

    // Emoji symbol
    ctx.font = `${size * 0.5}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(symbol, x + size / 2, drawY + size * 0.42);

    // Label
    ctx.font = `5px 'Press Start 2P', monospace`;
    ctx.fillStyle = "#ffd5ee";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(label, x + size / 2, drawY + size + 8);

    ctx.restore();
  }

  drawHeartCollectible(x: number, y: number, size: number, collectAnim: number) {
    const ctx = this.ctx;
    ctx.save();
    if (collectAnim > 0) {
      ctx.globalAlpha = 1 - collectAnim;
      ctx.translate(x, y - collectAnim * 30);
      const s = 1 + collectAnim * 0.5;
      ctx.scale(s, s);
      ctx.translate(-x, -(y - collectAnim * 30));
    }
    // Glow
    ctx.shadowColor = "#ff7eb6";
    ctx.shadowBlur = 10 + Math.sin(Date.now() * 0.005) * 4;
    this.drawHeart(x, y, size, "#ff7eb6");
    ctx.shadowBlur = 0;
    ctx.restore();
  }

  drawMemoryCard(x: number, y: number, triggered: boolean, title: string, time: number) {
    const ctx = this.ctx;
    const pulse = 1 + 0.08 * Math.sin(time * 3);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(pulse, pulse);
    ctx.translate(-x, -y);

    // Glow
    ctx.shadowColor = "#a2d2ff";
    ctx.shadowBlur = triggered ? 0 : 16;
    this.drawRoundRect(x - 20, y - 32, 40, 32, 6,
      triggered ? "rgba(162,210,255,0.3)" : "rgba(162,210,255,0.85)",
      "#a2d2ff", 2
    );
    ctx.shadowBlur = 0;

    // Star icon
    ctx.fillStyle = triggered ? "#aaa" : "#fff";
    ctx.font = "14px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("⭐", x, y - 18);

    ctx.restore();
  }

  drawTransitionOverlay(progress: number, type: "fade-black" | "fade-white") {
    if (progress <= 0) return;
    this.ctx.save();
    this.ctx.globalAlpha = Math.min(1, progress);
    this.ctx.fillStyle = type === "fade-black" ? "#000" : "#fff";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.restore();
  }

  drawStar(x: number, y: number, r: number, color = "#fff", points = 5) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const rad = i % 2 === 0 ? r : r * 0.4;
      ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTree(x: number, y: number, scale = 1, color = "#5aab5e") {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = "#8b6914";
    ctx.fillRect(-5, -30, 10, 30);
    ctx.fillStyle = color;
    [[0, -80, 28], [0, -65, 22], [0, -52, 18]].forEach(([, ty, r]) => {
      ctx.beginPath();
      ctx.moveTo(0, ty);
      ctx.lineTo(-r, ty + 30);
      ctx.lineTo(r, ty + 30);
      ctx.closePath();
      ctx.fill();
    });
    ctx.restore();
  }

  drawPlatform(x: number, y: number, w: number, color = "#7bc67e") {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w, 18, 6);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.25)";
    ctx.beginPath();
    ctx.roundRect(x + 4, y + 3, w - 8, 5, 3);
    ctx.fill();
  }
}