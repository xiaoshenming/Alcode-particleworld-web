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
  /** 获取指定位置材质的密度 */
  getDensity(x: number, y: number): number;
  /** 唤醒指定位置及其邻居（下一帧参与模拟） */
  wakeArea(cx: number, cy: number): void;
  /** 获取指定位置的温度（0=绝对零度，20=常温，100+=高温） */
  getTemp(x: number, y: number): number;
  /** 设置指定位置的温度 */
  setTemp(x: number, y: number, temp: number): void;
  /** 在指定位置增加温度 */
  addTemp(x: number, y: number, delta: number): void;
  /** 获取当前风力方向（-1=左, 0=无, 1=右） */
  getWind(): number;
  /** 获取当前风力强度（0~1） */
  getWindStrength(): number;
}
