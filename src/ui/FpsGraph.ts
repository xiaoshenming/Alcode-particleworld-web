/**
 * FPS 实时图表 —— 在右下角绘制帧率曲线
 * 记录最近 120 帧的帧时间，绘制折线图
 * 点击可展开/收起图表
 */
export class FpsGraph {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private fpsLabel: HTMLSpanElement;
  private expanded = false;

  /** 最近 N 帧的 FPS 值 */
  private history: number[] = [];
  private readonly maxHistory = 120;

  /** 帧计时 */
  private frameCount = 0;
  private currentFps = 0;
  /** 每秒更新一次 FPS 值 */
  private fpsUpdateInterval = 500;
  private lastFpsUpdate = performance.now();

  private readonly graphWidth = 160;
  private readonly graphHeight = 48;

  constructor() {
    // 容器
    this.container = document.createElement('div');
    this.container.id = 'fps-graph';
    this.container.title = '点击展开/收起性能图表';

    // FPS 文字
    this.fpsLabel = document.createElement('span');
    this.fpsLabel.className = 'fps-label';
    this.fpsLabel.textContent = '0 FPS';
    this.container.appendChild(this.fpsLabel);

    // Canvas 图表
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.graphWidth;
    this.canvas.height = this.graphHeight;
    this.canvas.className = 'fps-canvas';
    this.canvas.style.display = 'none';
    this.container.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;

    // 点击展开/收起
    this.container.addEventListener('click', () => {
      this.expanded = !this.expanded;
      this.canvas.style.display = this.expanded ? 'block' : 'none';
    });

    document.body.appendChild(this.container);
  }

  /** 每帧调用 */
  tick(): void {
    const now = performance.now();
    this.frameCount++;

    if (now - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.currentFps = Math.round(this.frameCount / ((now - this.lastFpsUpdate) / 1000));
      this.frameCount = 0;
      this.lastFpsUpdate = now;

      // 记录历史
      this.history.push(this.currentFps);
      if (this.history.length > this.maxHistory) {
        this.history.shift();
      }

      // 更新文字
      this.fpsLabel.textContent = `${this.currentFps} FPS`;

      // 颜色指示
      if (this.currentFps >= 50) {
        this.fpsLabel.style.color = '#6f6';
      } else if (this.currentFps >= 30) {
        this.fpsLabel.style.color = '#ff6';
      } else {
        this.fpsLabel.style.color = '#f66';
      }

      // 绘制图表
      if (this.expanded) {
        this.drawGraph();
      }
    }
  }

  private drawGraph(): void {
    const ctx = this.ctx;
    const w = this.graphWidth;
    const h = this.graphHeight;
    const data = this.history;

    // 背景
    ctx.fillStyle = 'rgba(10, 10, 25, 0.85)';
    ctx.fillRect(0, 0, w, h);

    if (data.length < 2) return;

    // 参考线 30fps / 60fps
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 0.5;
    const maxFps = 80;

    const y60 = h - (60 / maxFps) * h;
    const y30 = h - (30 / maxFps) * h;
    ctx.beginPath();
    ctx.moveTo(0, y60);
    ctx.lineTo(w, y60);
    ctx.moveTo(0, y30);
    ctx.lineTo(w, y30);
    ctx.stroke();

    // 标签
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '8px monospace';
    ctx.fillText('60', 1, y60 - 1);
    ctx.fillText('30', 1, y30 - 1);

    // 折线
    ctx.beginPath();
    const step = w / (this.maxHistory - 1);
    const offset = this.maxHistory - data.length;

    for (let i = 0; i < data.length; i++) {
      const x = (offset + i) * step;
      const y = h - Math.min(1, data[i] / maxFps) * h;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    // 渐变色线条
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, '#6f6');
    gradient.addColorStop(0.5, '#ff6');
    gradient.addColorStop(1, '#f66');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 填充区域
    const lastX = (offset + data.length - 1) * step;
    ctx.lineTo(lastX, h);
    ctx.lineTo(offset * step, h);
    ctx.closePath();
    const fillGradient = ctx.createLinearGradient(0, 0, 0, h);
    fillGradient.addColorStop(0, 'rgba(100, 255, 100, 0.15)');
    fillGradient.addColorStop(1, 'rgba(255, 100, 100, 0.05)');
    ctx.fillStyle = fillGradient;
    ctx.fill();
  }
}
