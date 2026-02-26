import { World } from '../core/World';

/**
 * 选区工具 —— 框选区域后可移动/复制/删除选区内容
 * - I 键进入/退出选区模式
 * - 选区模式下拖拽框选区域
 * - Ctrl+C 复制选区 / Ctrl+X 剪切选区 / Delete 删除选区
 * - Ctrl+V 粘贴（进入浮动状态，点击放置）
 * - 方向键微调浮动选区位置
 */

export interface SelectionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SelectionData {
  w: number;
  h: number;
  cells: Uint16Array;
}

export class SelectionTool {
  private world: World;
  /** 是否处于选区模式 */
  active = false;
  /** 当前选区框（网格坐标） */
  rect: SelectionRect | null = null;
  /** 正在拖拽框选 */
  private dragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  /** 剪贴板 */
  private clipboard: SelectionData | null = null;
  /** 浮动选区（等待放置） */
  floating: SelectionData | null = null;
  floatingX = 0;
  floatingY = 0;
  /** 正在拖拽浮动选区 */
  private movingFloating = false;
  private moveOffsetX = 0;
  private moveOffsetY = 0;
  /** 快照回调（用于撤销） */
  onSnapshot?: () => void;

  constructor(world: World) {
    this.world = world;
  }

  /** 进入/退出选区模式 */
  toggle(): boolean {
    this.active = !this.active;
    if (!this.active) {
      this.cancel();
    }
    return this.active;
  }

  /** 取消所有选区状态 */
  cancel(): void {
    // 如果有浮动选区，先放置
    if (this.floating) {
      this.placeFloating();
    }
    this.rect = null;
    this.dragging = false;
    this.floating = null;
  }

  /** 鼠标按下（网格坐标） */
  mouseDown(gx: number, gy: number): boolean {
    if (!this.active) return false;

    // 如果有浮动选区，点击放置
    if (this.floating) {
      if (this.isInFloating(gx, gy)) {
        // 开始拖拽浮动选区
        this.movingFloating = true;
        this.moveOffsetX = gx - this.floatingX;
        this.moveOffsetY = gy - this.floatingY;
        return true;
      }
      // 点击外部放置
      this.placeFloating();
      return true;
    }

    // 开始框选
    this.dragging = true;
    this.dragStartX = gx;
    this.dragStartY = gy;
    this.rect = { x: gx, y: gy, w: 1, h: 1 };
    return true;
  }

  /** 鼠标移动（网格坐标） */
  mouseMove(gx: number, gy: number): boolean {
    if (!this.active) return false;

    if (this.movingFloating && this.floating) {
      this.floatingX = gx - this.moveOffsetX;
      this.floatingY = gy - this.moveOffsetY;
      return true;
    }

    if (this.dragging) {
      const x = Math.min(this.dragStartX, gx);
      const y = Math.min(this.dragStartY, gy);
      const w = Math.abs(gx - this.dragStartX) + 1;
      const h = Math.abs(gy - this.dragStartY) + 1;
      this.rect = { x, y, w, h };
      return true;
    }

    return false;
  }

  /** 鼠标松开 */
  mouseUp(): boolean {
    if (!this.active) return false;

    if (this.movingFloating) {
      this.movingFloating = false;
      return true;
    }

    if (this.dragging) {
      this.dragging = false;
      // 太小的选区忽略
      if (this.rect && this.rect.w <= 1 && this.rect.h <= 1) {
        this.rect = null;
      }
      return true;
    }

    return false;
  }

  /** 复制选区内容到剪贴板 */
  copy(): boolean {
    if (!this.rect) return false;
    this.clipboard = this.captureRect(this.rect);
    return true;
  }

  /** 剪切选区内容 */
  cut(): boolean {
    if (!this.rect) return false;
    this.onSnapshot?.();
    this.clipboard = this.captureRect(this.rect);
    this.clearRect(this.rect);
    this.rect = null;
    return true;
  }

  /** 删除选区内容 */
  deleteSelection(): boolean {
    if (!this.rect) return false;
    this.onSnapshot?.();
    this.clearRect(this.rect);
    this.rect = null;
    return true;
  }

  /** 粘贴（进入浮动状态） */
  paste(): boolean {
    if (!this.clipboard) return false;
    // 如果有现有浮动选区先放置
    if (this.floating) {
      this.placeFloating();
    }
    this.floating = {
      w: this.clipboard.w,
      h: this.clipboard.h,
      cells: new Uint16Array(this.clipboard.cells),
    };
    // 放在画面中央
    this.floatingX = Math.floor((this.world.width - this.clipboard.w) / 2);
    this.floatingY = Math.floor((this.world.height - this.clipboard.h) / 2);
    this.rect = null;
    return true;
  }

  /** 放置浮动选区到世界 */
  placeFloating(): void {
    if (!this.floating) return;
    this.onSnapshot?.();
    const { w, h, cells } = this.floating;
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        const matId = cells[dy * w + dx];
        if (matId === 0) continue; // 跳过空气
        const wx = this.floatingX + dx;
        const wy = this.floatingY + dy;
        if (this.world.inBounds(wx, wy)) {
          this.world.set(wx, wy, matId);
        }
      }
    }
    this.floating = null;
  }

  /** 方向键微调浮动选区 */
  nudge(dx: number, dy: number): boolean {
    if (!this.floating) return false;
    this.floatingX += dx;
    this.floatingY += dy;
    return true;
  }

  /** 是否有选区或浮动选区（用于判断是否拦截输入） */
  hasSelection(): boolean {
    return this.rect !== null || this.floating !== null;
  }

  private isInFloating(gx: number, gy: number): boolean {
    if (!this.floating) return false;
    return gx >= this.floatingX && gx < this.floatingX + this.floating.w &&
           gy >= this.floatingY && gy < this.floatingY + this.floating.h;
  }

  private captureRect(rect: SelectionRect): SelectionData {
    const cells = new Uint16Array(rect.w * rect.h);
    for (let dy = 0; dy < rect.h; dy++) {
      for (let dx = 0; dx < rect.w; dx++) {
        const wx = rect.x + dx;
        const wy = rect.y + dy;
        if (this.world.inBounds(wx, wy)) {
          cells[dy * rect.w + dx] = this.world.get(wx, wy);
        }
      }
    }
    return { w: rect.w, h: rect.h, cells };
  }

  private clearRect(rect: SelectionRect): void {
    for (let dy = 0; dy < rect.h; dy++) {
      for (let dx = 0; dx < rect.w; dx++) {
        const wx = rect.x + dx;
        const wy = rect.y + dy;
        if (this.world.inBounds(wx, wy)) {
          this.world.set(wx, wy, 0);
        }
      }
    }
  }
}
