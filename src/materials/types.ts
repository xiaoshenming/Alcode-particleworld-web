/** 材质行为定义 */
export interface MaterialDef {
  id: number;
  name: string;
  /** 返回 ABGR 格式的颜色值（用于 Uint32Array 写入 ImageData） */
  color(): number;
  /** 密度，越大越重。0 = 空气，Infinity = 不可移动 */
  density: number;
  /** 每帧更新逻辑 */
  update(x: number, y: number, world: WorldAPI): void;
}

/** 暴露给材质 update 的世界接口，避免直接依赖 World 类 */
export interface WorldAPI {
  readonly width: number;
  readonly height: number;
  get(x: number, y: number): number;
  set(x: number, y: number, materialId: number): void;
  swap(x1: number, y1: number, x2: number, y2: number): void;
  isEmpty(x: number, y: number): boolean;
  inBounds(x: number, y: number): boolean;
  isUpdated(x: number, y: number): boolean;
  markUpdated(x: number, y: number): void;
}
