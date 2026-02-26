import { World } from '../core/World';
import { getMaterial } from '../materials/registry';

/**
 * 材质统计面板 —— 显示当前世界中各材质的粒子数量分布
 * 按数量降序排列，显示 Top 10 材质及其占比
 * 可通过按钮或快捷键 (S) 切换显示
 */
export class StatsPanel {
  private el: HTMLElement;
  private world: World;
  private visible = false;
  private listEl: HTMLElement;
  private frameCount = 0;

  constructor(world: World) {
    this.world = world;

    this.el = document.createElement('div');
    this.el.id = 'stats-panel';
    this.el.style.display = 'none';

    const title = document.createElement('div');
    title.className = 'stats-title';
    title.textContent = '材质统计';
    this.el.appendChild(title);

    this.listEl = document.createElement('div');
    this.listEl.className = 'stats-list';
    this.el.appendChild(this.listEl);

    document.body.appendChild(this.el);
  }

  toggle(): void {
    this.visible = !this.visible;
    this.el.style.display = this.visible ? 'flex' : 'none';
    if (this.visible) this.refresh();
  }

  isVisible(): boolean {
    return this.visible;
  }

  /** 每帧调用，每 30 帧刷新一次统计 */
  update(): void {
    if (!this.visible) return;
    this.frameCount++;
    if (this.frameCount % 30 === 0) {
      this.refresh();
    }
  }

  private refresh(): void {
    // 统计各材质数量
    const counts = new Map<number, number>();
    const cells = this.world.cells;
    let total = 0;
    for (let i = 0; i < cells.length; i++) {
      const id = cells[i];
      if (id === 0) continue;
      counts.set(id, (counts.get(id) || 0) + 1);
      total++;
    }

    // 按数量降序排列
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 10);

    // 构建列表
    this.listEl.innerHTML = '';

    if (total === 0) {
      const empty = document.createElement('div');
      empty.className = 'stats-row';
      empty.textContent = '世界为空';
      this.listEl.appendChild(empty);
      return;
    }

    for (const [id, count] of top) {
      const mat = getMaterial(id);
      if (!mat) continue;

      const row = document.createElement('div');
      row.className = 'stats-row';

      // 颜色指示器
      const dot = document.createElement('span');
      dot.className = 'stats-dot';
      const color = mat.color();
      const r = color & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = (color >> 16) & 0xFF;
      dot.style.backgroundColor = `rgb(${r},${g},${b})`;

      // 名称
      const name = document.createElement('span');
      name.className = 'stats-name';
      name.textContent = mat.name;

      // 数量和占比
      const info = document.createElement('span');
      info.className = 'stats-info';
      const pct = ((count / total) * 100).toFixed(1);
      info.textContent = `${count} (${pct}%)`;

      row.appendChild(dot);
      row.appendChild(name);
      row.appendChild(info);
      this.listEl.appendChild(row);
    }

    // 总计
    const totalRow = document.createElement('div');
    totalRow.className = 'stats-row stats-total';
    totalRow.textContent = `总计: ${total} 粒子`;
    this.listEl.appendChild(totalRow);
  }
}
