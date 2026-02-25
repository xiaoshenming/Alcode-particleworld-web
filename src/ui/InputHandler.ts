import { World } from '../core/World';

/**
 * 鼠标/触摸输入处理器
 * 将屏幕坐标转换为网格坐标，支持拖拽绘制
 */
export class InputHandler {
  private world: World;
  private canvas: HTMLCanvasElement;
  private scale: number;
  private painting = false;
  private selectedMaterial = 1; // 默认沙子
  private brushSize = 3;

  constructor(canvas: HTMLCanvasElement, world: World, scale: number) {
    this.canvas = canvas;
    this.world = world;
    this.scale = scale;
    this.bindEvents();
  }

  setMaterial(id: number): void {
    this.selectedMaterial = id;
  }

  getMaterial(): number {
    return this.selectedMaterial;
  }

  setBrushSize(size: number): void {
    this.brushSize = Math.max(1, Math.min(10, size));
  }

  getBrushSize(): number {
    return this.brushSize;
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousedown', (e) => {
      this.painting = true;
      this.paint(e);
    });
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.painting) this.paint(e);
    });
    this.canvas.addEventListener('mouseup', () => { this.painting = false; });
    this.canvas.addEventListener('mouseleave', () => { this.painting = false; });

    // 触摸支持
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.painting = true;
      this.paintTouch(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.painting) this.paintTouch(e);
    });
    this.canvas.addEventListener('touchend', () => { this.painting = false; });
  }

  private paint(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const gx = Math.floor((e.clientX - rect.left) / this.scale);
    const gy = Math.floor((e.clientY - rect.top) / this.scale);
    this.drawAt(gx, gy);
  }

  private paintTouch(e: TouchEvent): void {
    const touch = e.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const gx = Math.floor((touch.clientX - rect.left) / this.scale);
    const gy = Math.floor((touch.clientY - rect.top) / this.scale);
    this.drawAt(gx, gy);
  }

  private drawAt(cx: number, cy: number): void {
    const r = Math.floor(this.brushSize / 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.world.inBounds(x, y)) continue;
        // 圆形笔刷
        if (dx * dx + dy * dy > r * r) continue;
        // 只在空位放置（擦除模式除外）
        if (this.selectedMaterial === 0 || this.world.isEmpty(x, y)) {
          this.world.set(x, y, this.selectedMaterial);
        }
      }
    }
  }
}
