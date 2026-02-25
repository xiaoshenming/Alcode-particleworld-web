import { World } from '../core/World';

/** 笔刷形状类型 */
export type BrushShape = 'circle' | 'square' | 'line';

/**
 * 鼠标/触摸输入处理器
 * 将屏幕坐标转换为网格坐标，支持拖拽绘制和笔刷预览
 */
export class InputHandler {
  private world: World;
  private canvas: HTMLCanvasElement;
  private scale: number;
  private painting = false;
  /** 右键擦除模式 */
  private erasing = false;
  private selectedMaterial = 1; // 默认沙子
  private brushSize = 3;
  private brushShape: BrushShape = 'circle';
  /** 线条笔刷的起点 */
  private lineStartX = -1;
  private lineStartY = -1;
  /** 绘制开始时的回调（用于保存撤销快照） */
  onPaintStart?: () => void;

  /** 当前光标在网格中的位置（-1 表示不在画布上） */
  cursorX = -1;
  cursorY = -1;
  cursorVisible = false;

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

  setBrushShape(shape: BrushShape): void {
    this.brushShape = shape;
  }

  getBrushShape(): BrushShape {
    return this.brushShape;
  }

  private toGrid(clientX: number, clientY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    return [
      Math.floor((clientX - rect.left) / this.scale),
      Math.floor((clientY - rect.top) / this.scale),
    ];
  }

  private bindEvents(): void {
    // 禁用右键菜单
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('mousedown', (e) => {
      this.onPaintStart?.();
      // 右键 = 擦除模式
      this.erasing = e.button === 2;
      this.painting = true;
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);
      if (this.brushShape === 'line' && !this.erasing) {
        // 线条模式：记录起点，松开时画线
        this.lineStartX = gx;
        this.lineStartY = gy;
      } else {
        this.drawAt(gx, gy);
      }
    });
    this.canvas.addEventListener('mousemove', (e) => {
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);
      this.cursorX = gx;
      this.cursorY = gy;
      this.cursorVisible = true;
      if (this.painting && (this.brushShape !== 'line' || this.erasing)) {
        this.drawAt(gx, gy);
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      if (this.painting && this.brushShape === 'line' && !this.erasing && this.lineStartX >= 0) {
        const [gx, gy] = this.toGrid(e.clientX, e.clientY);
        this.drawLine(this.lineStartX, this.lineStartY, gx, gy);
        this.lineStartX = -1;
        this.lineStartY = -1;
      }
      this.painting = false;
      this.erasing = false;
    });
    this.canvas.addEventListener('mouseleave', () => {
      this.painting = false;
      this.erasing = false;
      this.cursorVisible = false;
      this.lineStartX = -1;
      this.lineStartY = -1;
    });

    // 滚轮调整笔刷大小
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.setBrushSize(this.brushSize + (e.deltaY < 0 ? 1 : -1));
      // 触发自定义事件通知 Toolbar 更新
      this.canvas.dispatchEvent(new CustomEvent('brushchange', { detail: this.brushSize }));
    }, { passive: false });

    // 触摸支持
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.onPaintStart?.();
      this.painting = true;
      this.paintTouch(e);
    });
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (this.painting) this.paintTouch(e);
    });
    this.canvas.addEventListener('touchend', () => { this.painting = false; });
  }

  private paintTouch(e: TouchEvent): void {
    const touch = e.touches[0];
    const [gx, gy] = this.toGrid(touch.clientX, touch.clientY);
    this.drawAt(gx, gy);
  }

  /** 在指定位置绘制（根据笔刷形状） */
  private drawAt(cx: number, cy: number): void {
    const matId = this.erasing ? 0 : this.selectedMaterial;
    const r = Math.floor(this.brushSize / 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.world.inBounds(x, y)) continue;
        // 根据形状判断是否在笔刷范围内
        if (this.brushShape === 'circle') {
          if (dx * dx + dy * dy > r * r) continue;
        }
        // square 不需要额外判断，矩形范围即可
        if (matId === 0 || this.world.isEmpty(x, y)) {
          this.world.set(x, y, matId);
        }
      }
    }
  }

  /** Bresenham 直线绘制 */
  private drawLine(x0: number, y0: number, x1: number, y1: number): void {
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;
    let cx = x0;
    let cy = y0;

    while (true) {
      this.drawDot(cx, cy);
      if (cx === x1 && cy === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; cx += sx; }
      if (e2 < dx) { err += dx; cy += sy; }
    }
  }

  /** 在单个点绘制一个笔刷大小的点 */
  private drawDot(cx: number, cy: number): void {
    const matId = this.erasing ? 0 : this.selectedMaterial;
    const r = Math.floor(this.brushSize / 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.world.inBounds(x, y)) continue;
        if (dx * dx + dy * dy > r * r) continue;
        if (matId === 0 || this.world.isEmpty(x, y)) {
          this.world.set(x, y, matId);
        }
      }
    }
  }

  /** 获取线条笔刷的起点（用于渲染预览） */
  getLineStart(): [number, number] {
    return [this.lineStartX, this.lineStartY];
  }

  /** 是否正在绘制线条 */
  isDrawingLine(): boolean {
    return this.painting && this.brushShape === 'line' && this.lineStartX >= 0;
  }
}
