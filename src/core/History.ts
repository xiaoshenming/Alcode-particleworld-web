/**
 * 撤销/重做历史管理器
 * 基于快照的方式记录世界状态变化
 * 使用环形缓冲区限制内存占用（最多保存 20 步）
 */
export class History {
  private snapshots: Uint16Array[] = [];
  private pointer = -1;
  private readonly maxSteps: number;

  constructor(maxSteps = 20) {
    this.maxSteps = maxSteps;
  }

  /** 保存当前状态快照（在用户操作前调用） */
  pushSnapshot(cells: Uint16Array): void {
    // 丢弃 pointer 之后的所有快照（重做历史作废）
    this.snapshots.length = this.pointer + 1;
    // 深拷贝
    this.snapshots.push(new Uint16Array(cells));
    // 超出上限时移除最早的快照
    if (this.snapshots.length > this.maxSteps) {
      this.snapshots.shift();
    }
    this.pointer = this.snapshots.length - 1;
  }

  /** 撤销：返回上一个快照，如果没有则返回 null */
  undo(): Uint16Array | null {
    if (this.pointer < 0) return null;
    const snapshot = this.snapshots[this.pointer];
    this.pointer--;
    return snapshot;
  }

  /** 重做：返回下一个快照，如果没有则返回 null */
  redo(): Uint16Array | null {
    if (this.pointer + 1 >= this.snapshots.length) return null;
    this.pointer++;
    return this.snapshots[this.pointer];
  }

  /** 是否可以撤销 */
  canUndo(): boolean {
    return this.pointer >= 0;
  }

  /** 是否可以重做 */
  canRedo(): boolean {
    return this.pointer + 1 < this.snapshots.length;
  }

  /** 清空历史 */
  clear(): void {
    this.snapshots.length = 0;
    this.pointer = -1;
  }
}
