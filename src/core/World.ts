import type { WorldAPI } from '../materials/types';
import { getMaterial } from '../materials/registry';

/**
 * 网格世界 —— 用 TypedArray 存储所有粒子数据
 */
export class World implements WorldAPI {
  readonly width: number;
  readonly height: number;
  /** 材质 ID 网格 */
  cells: Uint8Array;
  /** 颜色网格（ABGR 格式，直接写入 ImageData） */
  colors: Uint32Array;
  /** 本帧更新标记，防止同一粒子被多次处理 */
  private _updated: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = width * height;
    this.cells = new Uint8Array(size);
    this.colors = new Uint32Array(size);
    this._updated = new Uint8Array(size);

    // 初始化为空气背景色
    const emptyMat = getMaterial(0);
    const bgColor = emptyMat ? emptyMat.color() : 0xFF3E2116;
    this.colors.fill(bgColor);
  }

  private idx(x: number, y: number): number {
    return y * this.width + x;
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  get(x: number, y: number): number {
    return this.cells[this.idx(x, y)];
  }

  set(x: number, y: number, materialId: number): void {
    const i = this.idx(x, y);
    this.cells[i] = materialId;
    const mat = getMaterial(materialId);
    this.colors[i] = mat ? mat.color() : 0xFF3E2116;
  }

  isEmpty(x: number, y: number): boolean {
    return this.cells[this.idx(x, y)] === 0;
  }

  swap(x1: number, y1: number, x2: number, y2: number): void {
    const i1 = this.idx(x1, y1);
    const i2 = this.idx(x2, y2);

    // 交换材质 ID
    const tmpCell = this.cells[i1];
    this.cells[i1] = this.cells[i2];
    this.cells[i2] = tmpCell;

    // 交换颜色
    const tmpColor = this.colors[i1];
    this.colors[i1] = this.colors[i2];
    this.colors[i2] = tmpColor;
  }

  isUpdated(x: number, y: number): boolean {
    return this._updated[this.idx(x, y)] === 1;
  }

  markUpdated(x: number, y: number): void {
    this._updated[this.idx(x, y)] = 1;
  }

  /** 每帧开始前重置更新标记 */
  resetUpdated(): void {
    this._updated.fill(0);
  }

  getDensity(x: number, y: number): number {
    const mat = getMaterial(this.cells[this.idx(x, y)]);
    return mat ? mat.density : 0;
  }
}
