import { World } from '../core/World';
import { getMaterial } from '../materials/registry';

/**
 * 材质统计面板 —— 显示当前世界中各材质的粒子数量分布
 * 按数量降序排列，显示 Top 10 材质及其占比
 * 包含比例条和总粒子数趋势迷你图
 * 可通过按钮或快捷键 (S) 切换显示
 */
export class StatsPanel {
  private el: HTMLElement;
  private world: World;
  private visible = false;
  private listEl: HTMLElement;
  private frameCount = 0;
  /** 总粒子数历史记录（用于趋势图） */
  private totalHistory: number[] = [];
  private readonly maxHistory = 60;
  /** 趋势图 Canvas */
  private chartCanvas: HTMLCanvasElement;
  private chartCtx: CanvasRenderingContext2D;

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

    // 趋势迷你图
    this.chartCanvas = document.createElement('canvas');
    this.chartCanvas.className = 'stats-chart';
    this.chartCanvas.width = 180;
    this.chartCanvas.height = 24;
    this.el.appendChild(this.chartCanvas);
    this.chartCtx = this.chartCanvas.getContext('2d')!;

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
    // 单次遍历：同时统计材质数量、活跃粒子数、温度总和
    const counts = new Map<number, number>();
    const cells = this.world.cells;
    const awake = (this.world as unknown as { _awake: Uint8Array })['_awake'];
    const tempBuf = this.world.getTempBuffer();
    let total = 0;
    let active = 0;
    let tempSum = 0;
    for (let i = 0; i < cells.length; i++) {
      const id = cells[i];
      if (id === 0) continue;
      counts.set(id, (counts.get(id) || 0) + 1);
      total++;
      tempSum += tempBuf[i];
      if (awake && awake[i] === 1) active++;
    }

    // 记录历史
    this.totalHistory.push(total);
    if (this.totalHistory.length > this.maxHistory) {
      this.totalHistory.shift();
    }

    // 按数量降序排列
    const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 10);
    const maxCount = top.length > 0 ? top[0][1] : 1;

    // 构建列表
    this.listEl.innerHTML = '';

    if (total === 0) {
      const empty = document.createElement('div');
      empty.className = 'stats-row';
      empty.textContent = '世界为空';
      this.listEl.appendChild(empty);
      this.drawChart();
      return;
    }

    for (const [id, count] of top) {
      const mat = getMaterial(id);
      if (!mat) continue;

      const wrapper = document.createElement('div');

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
      wrapper.appendChild(row);

      // 比例条
      const barBg = document.createElement('div');
      barBg.className = 'stats-bar-bg';
      const barFill = document.createElement('div');
      barFill.className = 'stats-bar-fill';
      barFill.style.width = `${(count / maxCount) * 100}%`;
      barFill.style.backgroundColor = `rgb(${r},${g},${b})`;
      barBg.appendChild(barFill);
      wrapper.appendChild(barBg);

      this.listEl.appendChild(wrapper);
    }

    // 总计
    const totalRow = document.createElement('div');
    totalRow.className = 'stats-row stats-total';
    totalRow.textContent = `总计: ${total} 粒子`;
    this.listEl.appendChild(totalRow);

    // 活跃粒子比例 & 平均温度（复用上方单次遍历的结果）
    const avgTemp = total > 0 ? tempSum / total : 20;
    const activeRatio = total > 0 ? ((active / total) * 100).toFixed(1) : '0.0';

    const activeRow = document.createElement('div');
    activeRow.className = 'stats-row stats-extra';
    activeRow.textContent = `活跃: ${active} (${activeRatio}%)`;
    this.listEl.appendChild(activeRow);

    const tempRow = document.createElement('div');
    tempRow.className = 'stats-row stats-extra';
    tempRow.textContent = `平均温度: ${avgTemp.toFixed(1)}°`;
    this.listEl.appendChild(tempRow);

    // 绘制趋势图
    this.drawChart();
  }

  /** 绘制总粒子数趋势迷你图 */
  private drawChart(): void {
    const ctx = this.chartCtx;
    const w = this.chartCanvas.width;
    const h = this.chartCanvas.height;
    const data = this.totalHistory;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(10, 10, 25, 0.6)';
    ctx.fillRect(0, 0, w, h);

    if (data.length < 2) return;

    const maxVal = Math.max(...data, 1);
    const step = w / (this.maxHistory - 1);
    const offset = this.maxHistory - data.length;

    // 填充区域
    ctx.beginPath();
    ctx.moveTo(offset * step, h);
    for (let i = 0; i < data.length; i++) {
      const x = (offset + i) * step;
      const y = h - (data[i] / maxVal) * (h - 2);
      ctx.lineTo(x, y);
    }
    ctx.lineTo((offset + data.length - 1) * step, h);
    ctx.closePath();
    ctx.fillStyle = 'rgba(100, 180, 255, 0.15)';
    ctx.fill();

    // 折线
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (offset + i) * step;
      const y = h - (data[i] / maxVal) * (h - 2);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 当前值标签
    const current = data[data.length - 1];
    ctx.fillStyle = 'rgba(200, 220, 255, 0.6)';
    ctx.font = '8px monospace';
    ctx.fillText(String(current), 2, 9);
  }
}
