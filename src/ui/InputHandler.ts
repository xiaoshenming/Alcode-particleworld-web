import { World } from '../core/World';
import { getAllMaterials } from '../materials/registry';

/** 笔刷形状类型 */
export type BrushShape = 'circle' | 'square' | 'line' | 'spray';
/** 绘制模式 */
export type DrawMode = 'brush' | 'fill' | 'replace';

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
  private drawMode: DrawMode = 'brush';
  /** 随机材质模式 */
  private randomMode = false;
  /** 镜像绘制模式 */
  private mirrorMode = false;
  /** 喷雾密度 (0.1~1.0) */
  private sprayDensity = 0.4;
  /** 渐变笔刷模式 */
  private gradientBrush = false;
  /** 替换模式的目标材质 ID */
  private replaceTarget = -1;
  /** 笔刷旋转角度（弧度，仅方形笔刷生效） */
  private brushAngle = 0;
  /** 中键拖拽平移状态 */
  private panning = false;
  private panLastX = 0;
  private panLastY = 0;
  /** 线条笔刷的起点 */
  private lineStartX = -1;
  private lineStartY = -1;
  /** 绘制开始时的回调（用于保存撤销快照） */
  onPaintStart?: () => void;
  /** 缩放回调 */
  onZoom?: (delta: number, screenX: number, screenY: number) => void;
  /** 平移回调 */
  onPan?: (dx: number, dy: number) => void;
  /** 重置视图回调 */
  onResetView?: () => void;
  /** 外部坐标转换函数（用于缩放平移后的坐标映射） */
  screenToGrid?: (sx: number, sy: number) => [number, number];

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

  setDrawMode(mode: DrawMode): void {
    this.drawMode = mode;
  }

  getDrawMode(): DrawMode {
    return this.drawMode;
  }

  setRandomMode(on: boolean): void {
    this.randomMode = on;
  }

  getRandomMode(): boolean {
    return this.randomMode;
  }

  setMirrorMode(on: boolean): void {
    this.mirrorMode = on;
  }

  getMirrorMode(): boolean {
    return this.mirrorMode;
  }

  setSprayDensity(density: number): void {
    this.sprayDensity = Math.max(0.1, Math.min(1.0, density));
  }

  getSprayDensity(): number {
    return this.sprayDensity;
  }

  setGradientBrush(on: boolean): void {
    this.gradientBrush = on;
  }

  getGradientBrush(): boolean {
    return this.gradientBrush;
  }

  setBrushAngle(angle: number): void {
    // 归一化到 0~2π
    this.brushAngle = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
  }

  getBrushAngle(): number {
    return this.brushAngle;
  }

  /** 获取当前绘制用的材质 ID（随机模式下每次调用返回不同材质） */
  private getDrawMaterial(): number {
    if (this.erasing) return 0;
    if (!this.randomMode) return this.selectedMaterial;
    // 随机模式：从非空气、非工具类材质中随机选一种
    const mats = getAllMaterials().filter(m => m.id > 0 && m.category !== '工具');
    if (mats.length === 0) return this.selectedMaterial;
    return mats[Math.floor(Math.random() * mats.length)].id;
  }

  private toGrid(clientX: number, clientY: number): [number, number] {
    const rect = this.canvas.getBoundingClientRect();
    const sx = clientX - rect.left;
    const sy = clientY - rect.top;
    if (this.screenToGrid) {
      return this.screenToGrid(sx, sy);
    }
    return [Math.floor(sx / this.scale), Math.floor(sy / this.scale)];
  }

  private bindEvents(): void {
    // 禁用右键菜单
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    this.canvas.addEventListener('mousedown', (e) => {
      // 中键拖拽平移
      if (e.button === 1) {
        e.preventDefault();
        this.panning = true;
        this.panLastX = e.clientX;
        this.panLastY = e.clientY;
        return;
      }
      this.onPaintStart?.();
      // 右键 = 擦除模式
      this.erasing = e.button === 2;
      this.painting = true;
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);

      // 填充模式
      if (this.drawMode === 'fill' && !this.erasing) {
        this.floodFill(gx, gy, this.selectedMaterial);
        this.painting = false;
        return;
      }

      // 替换模式：记录光标下的目标材质
      if (this.drawMode === 'replace' && !this.erasing) {
        this.replaceTarget = this.world.inBounds(gx, gy) ? this.world.get(gx, gy) : -1;
      }

      if (this.brushShape === 'line' && !this.erasing) {
        // 线条模式：记录起点，松开时画线
        this.lineStartX = gx;
        this.lineStartY = gy;
      } else {
        this.drawAt(gx, gy);
      }
    });
    this.canvas.addEventListener('mousemove', (e) => {
      // 中键拖拽平移
      if (this.panning) {
        const dx = e.clientX - this.panLastX;
        const dy = e.clientY - this.panLastY;
        this.panLastX = e.clientX;
        this.panLastY = e.clientY;
        this.onPan?.(dx, dy);
        return;
      }
      const [gx, gy] = this.toGrid(e.clientX, e.clientY);
      this.cursorX = gx;
      this.cursorY = gy;
      this.cursorVisible = true;
      if (this.painting && (this.brushShape !== 'line' || this.erasing)) {
        this.drawAt(gx, gy);
      }
    });
    this.canvas.addEventListener('mouseup', (e) => {
      // 停止中键平移
      if (this.panning) {
        this.panning = false;
        return;
      }
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

    // 滚轮调整笔刷大小 / Shift+滚轮旋转方形笔刷 / Ctrl+滚轮缩放
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Ctrl+滚轮：缩放视图
        const rect = this.canvas.getBoundingClientRect();
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        this.onZoom?.(e.deltaY < 0 ? 1 : -1, sx, sy);
      } else if (e.shiftKey && this.brushShape === 'square') {
        // Shift+滚轮：旋转方形笔刷（每次 15°）
        const step = Math.PI / 12; // 15°
        this.setBrushAngle(this.brushAngle + (e.deltaY < 0 ? step : -step));
        this.canvas.dispatchEvent(new CustomEvent('brushanglechange', { detail: this.brushAngle }));
      } else {
        this.setBrushSize(this.brushSize + (e.deltaY < 0 ? 1 : -1));
        this.canvas.dispatchEvent(new CustomEvent('brushchange', { detail: this.brushSize }));
      }
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

  /** 放置单个像素（含镜像） */
  private placePixel(x: number, y: number, matId: number): void {
    if (this.world.inBounds(x, y) && (matId === 0 || this.world.isEmpty(x, y))) {
      this.world.set(x, y, matId);
    }
    if (this.mirrorMode) {
      const mx = this.world.width - 1 - x;
      if (mx !== x && this.world.inBounds(mx, y) && (matId === 0 || this.world.isEmpty(mx, y))) {
        this.world.set(mx, y, matId);
      }
    }
  }

  /** 在指定位置绘制（根据笔刷形状） */
  private drawAt(cx: number, cy: number): void {
    const r = Math.floor(this.brushSize / 2);

    // 替换模式：只替换与目标材质相同的粒子
    if (this.drawMode === 'replace' && !this.erasing && this.replaceTarget >= 0) {
      const matId = this.getDrawMaterial();
      if (matId === this.replaceTarget) return; // 相同材质无需替换
      const replScanR = (this.brushShape === 'square' && this.brushAngle !== 0)
        ? Math.ceil(r * 1.42) : r;
      for (let dy = -replScanR; dy <= replScanR; dy++) {
        for (let dx = -replScanR; dx <= replScanR; dx++) {
          const x = cx + dx;
          const y = cy + dy;
          if (!this.world.inBounds(x, y)) continue;
          if (this.brushShape === 'circle' || this.brushShape === 'spray') {
            if (dx * dx + dy * dy > r * r) continue;
          }
          if (this.brushShape === 'square' && this.brushAngle !== 0) {
            const cos = Math.cos(-this.brushAngle);
            const sin = Math.sin(-this.brushAngle);
            const rx = dx * cos - dy * sin;
            const ry = dx * sin + dy * cos;
            if (Math.abs(rx) > r || Math.abs(ry) > r) continue;
          }
          if (this.world.get(x, y) === this.replaceTarget) {
            this.world.set(x, y, matId);
            if (this.mirrorMode) {
              const mx = this.world.width - 1 - x;
              if (mx !== x && this.world.inBounds(mx, y) && this.world.get(mx, y) === this.replaceTarget) {
                this.world.set(mx, y, matId);
              }
            }
          }
        }
      }
      return;
    }

    if (this.brushShape === 'spray') {
      // 喷雾模式：在圆形范围内随机散布粒子
      const area = Math.PI * r * r;
      const count = Math.max(1, Math.floor(area * this.sprayDensity));
      for (let i = 0; i < count; i++) {
        // 极坐标随机采样，保证均匀分布
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * (r + 0.5);
        const x = cx + Math.round(Math.cos(angle) * dist);
        const y = cy + Math.round(Math.sin(angle) * dist);
        if (!this.world.inBounds(x, y)) continue;
        this.placePixel(x, y, this.getDrawMaterial());
      }
      return;
    }

    // 旋转方形笔刷时扩大扫描范围
    const scanR = (this.brushShape === 'square' && this.brushAngle !== 0)
      ? Math.ceil(r * 1.42) // √2 ≈ 1.414
      : r;

    for (let dy = -scanR; dy <= scanR; dy++) {
      for (let dx = -scanR; dx <= scanR; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.world.inBounds(x, y)) continue;
        if (this.brushShape === 'circle') {
          if (dx * dx + dy * dy > r * r) continue;
        }
        // 方形笔刷旋转：逆旋转判断点是否在原始方形内
        if (this.brushShape === 'square' && this.brushAngle !== 0) {
          const cos = Math.cos(-this.brushAngle);
          const sin = Math.sin(-this.brushAngle);
          const rx = dx * cos - dy * sin;
          const ry = dx * sin + dy * cos;
          if (Math.abs(rx) > r || Math.abs(ry) > r) continue;
        }
        // 渐变笔刷：边缘放置概率降低
        if (this.gradientBrush && r > 1) {
          const dist = Math.sqrt(dx * dx + dy * dy);
          const ratio = dist / r; // 0(中心)~1(边缘)
          const prob = 1 - ratio * ratio; // 二次衰减
          if (Math.random() > prob) continue;
        }
        this.placePixel(x, y, this.getDrawMaterial());
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
    const r = Math.floor(this.brushSize / 2);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx;
        const y = cy + dy;
        if (!this.world.inBounds(x, y)) continue;
        if (dx * dx + dy * dy > r * r) continue;
        this.placePixel(x, y, this.getDrawMaterial());
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

  /** 洪水填充（BFS） */
  private floodFill(startX: number, startY: number, fillMat: number): void {
    if (!this.world.inBounds(startX, startY)) return;
    const targetMat = this.world.get(startX, startY);
    if (!this.randomMode && targetMat === fillMat) return;

    const w = this.world.width;
    const h = this.world.height;
    const maxFill = 50000;
    let filled = 0;

    const visited = new Uint8Array(w * h);
    const queue: number[] = [startX, startY];
    visited[startY * w + startX] = 1;

    while (queue.length > 0 && filled < maxFill) {
      const x = queue.shift()!;
      const y = queue.shift()!;

      const mat = this.randomMode ? this.getDrawMaterial() : fillMat;
      this.world.set(x, y, mat);
      filled++;

      const neighbors: [number, number][] = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
      for (const [nx, ny] of neighbors) {
        if (!this.world.inBounds(nx, ny)) continue;
        const idx = ny * w + nx;
        if (visited[idx]) continue;
        if (this.world.get(nx, ny) !== targetMat) continue;
        visited[idx] = 1;
        queue.push(nx, ny);
      }
    }
  }
}
