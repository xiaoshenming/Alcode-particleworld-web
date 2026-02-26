import { getMaterial } from '../materials/registry';

/**
 * 材质快速轮盘 —— 按住 ` 键弹出径向菜单
 * 显示最近使用的 8 种材质，鼠标移动选择后松开确认
 */
export class RadialMenu {
  private overlay: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private visible = false;
  /** 最近使用的材质 ID 列表（最多 8 个） */
  private recentMaterials: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
  /** 当前高亮的扇区索引（-1 = 无） */
  private hoverIndex = -1;
  /** 轮盘中心屏幕坐标 */
  private centerX = 0;
  private centerY = 0;
  /** 选择回调 */
  private onSelect: ((matId: number) => void) | null = null;

  private readonly RADIUS = 100;
  private readonly INNER_RADIUS = 30;
  private readonly MAX_ITEMS = 8;
  private readonly STORAGE_KEY = 'pw-recent-materials';

  constructor() {
    // 创建覆盖层
    this.overlay = document.createElement('div');
    this.overlay.id = 'radial-menu-overlay';
    this.overlay.style.cssText = `
      display: none; position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh; z-index: 9999;
      cursor: crosshair;
    `;

    // 创建 Canvas
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.RADIUS * 2 + 40;
    this.canvas.height = this.RADIUS * 2 + 40;
    this.canvas.style.cssText = 'position: absolute; pointer-events: none;';
    this.overlay.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d')!;

    // 事件绑定
    this.overlay.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.overlay.addEventListener('mouseup', (e) => this.handleMouseUp(e));

    document.body.appendChild(this.overlay);
    this.loadRecent();
  }

  /** 记录使用了某个材质（加入最近列表） */
  recordUsage(matId: number): void {
    if (matId === 0) return; // 不记录空气
    const idx = this.recentMaterials.indexOf(matId);
    if (idx !== -1) this.recentMaterials.splice(idx, 1);
    this.recentMaterials.unshift(matId);
    if (this.recentMaterials.length > this.MAX_ITEMS) {
      this.recentMaterials.length = this.MAX_ITEMS;
    }
    this.saveRecent();
  }

  /** 显示轮盘 */
  show(screenX: number, screenY: number, onSelect: (matId: number) => void): void {
    if (this.recentMaterials.length === 0) return;
    this.visible = true;
    this.onSelect = onSelect;
    this.centerX = screenX;
    this.centerY = screenY;
    this.hoverIndex = -1;

    // 定位 Canvas
    this.canvas.style.left = `${screenX - this.canvas.width / 2}px`;
    this.canvas.style.top = `${screenY - this.canvas.height / 2}px`;

    this.overlay.style.display = 'block';
    this.draw();
  }

  /** 隐藏轮盘 */
  hide(): void {
    this.visible = false;
    this.overlay.style.display = 'none';
    this.onSelect = null;
  }

  isVisible(): boolean {
    return this.visible;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (!this.visible) return;
    const dx = e.clientX - this.centerX;
    const dy = e.clientY - this.centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < this.INNER_RADIUS) {
      this.hoverIndex = -1;
    } else {
      // 计算角度，从正上方开始顺时针
      let angle = Math.atan2(dy, dx) + Math.PI / 2;
      if (angle < 0) angle += Math.PI * 2;
      const count = Math.min(this.recentMaterials.length, this.MAX_ITEMS);
      const sectorAngle = (Math.PI * 2) / count;
      this.hoverIndex = Math.floor(angle / sectorAngle) % count;
    }
    this.draw();
  }

  private handleMouseUp(_e: MouseEvent): void {
    if (!this.visible) return;
    if (this.hoverIndex >= 0 && this.hoverIndex < this.recentMaterials.length) {
      const matId = this.recentMaterials[this.hoverIndex];
      this.onSelect?.(matId);
    }
    this.hide();
  }

  private draw(): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const count = Math.min(this.recentMaterials.length, this.MAX_ITEMS);
    const sectorAngle = (Math.PI * 2) / count;

    ctx.clearRect(0, 0, w, h);

    // 背景圆盘
    ctx.beginPath();
    ctx.arc(cx, cy, this.RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 15, 30, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制每个扇区
    for (let i = 0; i < count; i++) {
      const matId = this.recentMaterials[i];
      const mat = getMaterial(matId);
      if (!mat) continue;

      // 扇区角度（从正上方开始，顺时针）
      const startAngle = i * sectorAngle - Math.PI / 2;
      const endAngle = startAngle + sectorAngle;
      const midAngle = startAngle + sectorAngle / 2;
      const isHover = i === this.hoverIndex;

      // 扇区填充
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, this.RADIUS - 2, startAngle, endAngle);
      ctx.closePath();

      if (isHover) {
        ctx.fillStyle = 'rgba(80, 140, 255, 0.4)';
      } else {
        ctx.fillStyle = 'rgba(30, 30, 60, 0.3)';
      }
      ctx.fill();

      // 扇区分割线
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(
        cx + Math.cos(startAngle) * this.RADIUS,
        cy + Math.sin(startAngle) * this.RADIUS,
      );
      ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 材质色块（在扇区中间位置）
      const iconDist = (this.INNER_RADIUS + this.RADIUS) / 2;
      const iconX = cx + Math.cos(midAngle) * iconDist;
      const iconY = cy + Math.sin(midAngle) * iconDist;

      // 色块
      const color = mat.color();
      const r = color & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = (color >> 16) & 0xFF;
      const blockSize = isHover ? 16 : 12;

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(iconX - blockSize / 2, iconY - blockSize / 2 - 6, blockSize, blockSize);

      // 材质名称
      ctx.fillStyle = isHover ? 'rgba(255, 255, 255, 0.95)' : 'rgba(200, 200, 220, 0.7)';
      ctx.font = isHover ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(mat.name, iconX, iconY + blockSize / 2 - 2);
    }

    // 中心圆
    ctx.beginPath();
    ctx.arc(cx, cy, this.INNER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10, 10, 25, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 中心文字
    ctx.fillStyle = 'rgba(150, 170, 220, 0.8)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('最近', cx, cy - 5);
    ctx.fillText('材质', cx, cy + 7);
  }

  private saveRecent(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.recentMaterials));
    } catch { /* ignore */ }
  }

  private loadRecent(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const arr = JSON.parse(data);
        if (Array.isArray(arr) && arr.length > 0) {
          this.recentMaterials = arr.filter((id: number) => typeof id === 'number' && id > 0).slice(0, this.MAX_ITEMS);
        }
      }
    } catch { /* ignore */ }
  }
}
