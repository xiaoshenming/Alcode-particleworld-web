import type { WorldAPI } from '../materials/types';
import { getMaterial } from '../materials/registry';

/**
 * 网格世界 —— 用 TypedArray 存储所有粒子数据
 * 包含活跃标记系统，静止粒子跳过更新以提升性能
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
  /** 活跃标记：只有活跃的粒子才会被模拟 */
  private _awake: Uint8Array;
  /** 下一帧的活跃标记（双缓冲） */
  private _awakeNext: Uint8Array;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    const size = width * height;
    this.cells = new Uint8Array(size);
    this.colors = new Uint32Array(size);
    this._updated = new Uint8Array(size);
    this._awake = new Uint8Array(size);
    this._awakeNext = new Uint8Array(size);

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
    // 被修改的格子及其邻居需要唤醒
    this.wakeArea(x, y);
  }

  isEmpty(x: number, y: number): boolean {
    return this.cells[this.idx(x, y)] === 0;
  }

  swap(x1: number, y1: number, x2: number, y2: number): void {
    const i1 = this.idx(x1, y1);
    const i2 = this.idx(x2, y2);

    const tmpCell = this.cells[i1];
    this.cells[i1] = this.cells[i2];
    this.cells[i2] = tmpCell;

    const tmpColor = this.colors[i1];
    this.colors[i1] = this.colors[i2];
    this.colors[i2] = tmpColor;

    // 交换涉及的两个位置都需要唤醒
    this.wakeArea(x1, y1);
    this.wakeArea(x2, y2);
  }

  isUpdated(x: number, y: number): boolean {
    return this._updated[this.idx(x, y)] === 1;
  }

  markUpdated(x: number, y: number): void {
    this._updated[this.idx(x, y)] = 1;
  }

  /** 检查粒子是否活跃 */
  isAwake(x: number, y: number): boolean {
    return this._awake[this.idx(x, y)] === 1;
  }

  /** 唤醒一个格子及其周围 3x3 区域（下一帧生效） */
  wakeArea(cx: number, cy: number): void {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = cx + dx;
        const ny = cy + dy;
        if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
          this._awakeNext[ny * this.width + nx] = 1;
        }
      }
    }
  }

  /** 每帧开始前：重置更新标记，交换活跃缓冲 */
  resetUpdated(): void {
    this._updated.fill(0);
    // 双缓冲交换：本帧的 awakeNext 变成下帧的 awake
    const tmp = this._awake;
    this._awake = this._awakeNext;
    this._awakeNext = tmp;
    this._awakeNext.fill(0);
  }

  getDensity(x: number, y: number): number {
    const mat = getMaterial(this.cells[this.idx(x, y)]);
    return mat ? mat.density : 0;
  }

  /** 统计非空粒子数量 */
  getParticleCount(): number {
    let count = 0;
    for (let i = 0; i < this.cells.length; i++) {
      if (this.cells[i] !== 0) count++;
    }
    return count;
  }

  /** 清空所有粒子 */
  clear(): void {
    this.cells.fill(0);
    const emptyMat = getMaterial(0);
    const bgColor = emptyMat ? emptyMat.color() : 0xFF3E2116;
    this.colors.fill(bgColor);
    this._awake.fill(0);
    this._awakeNext.fill(0);
  }

  /** 序列化世界状态为 JSON 字符串（只保存 cells） */
  save(): string {
    // 用 RLE 压缩 cells 数组
    const runs: [number, number][] = [];
    let current = this.cells[0];
    let count = 1;
    for (let i = 1; i < this.cells.length; i++) {
      if (this.cells[i] === current) {
        count++;
      } else {
        runs.push([current, count]);
        current = this.cells[i];
        count = 1;
      }
    }
    runs.push([current, count]);
    return JSON.stringify({ w: this.width, h: this.height, rle: runs });
  }

  /** 从 JSON 字符串恢复世界状态 */
  load(data: string): boolean {
    try {
      const obj = JSON.parse(data);
      if (obj.w !== this.width || obj.h !== this.height) return false;
      // 解压 RLE
      let idx = 0;
      for (const [val, count] of obj.rle as [number, number][]) {
        for (let i = 0; i < count; i++) {
          this.cells[idx++] = val;
        }
      }
      // 重建颜色并唤醒所有非空粒子
      for (let i = 0; i < this.cells.length; i++) {
        const mat = getMaterial(this.cells[i]);
        this.colors[i] = mat ? mat.color() : 0xFF3E2116;
        if (this.cells[i] !== 0) {
          const x = i % this.width;
          const y = Math.floor(i / this.width);
          this.wakeArea(x, y);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
