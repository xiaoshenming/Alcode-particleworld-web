import { World } from '../core/World';
import { getMaterial } from '../materials/registry';

/**
 * 材质信息面板 —— 显示光标位置的材质详情
 * 固定在画布右下角，实时更新
 * 修复：支持缩放/平移坐标（通过 screenToGrid 回调）
 * 增强：温度颜色指示（蓝→绿→黄→红）
 */
export class InfoPanel {
  private el: HTMLElement;
  private world: World;
  private scale: number;
  private canvas: HTMLCanvasElement;
  private visible = false;
  private screenX = -1;
  private screenY = -1;
  /** 外部注入坐标转换（支持缩放/平移） */
  screenToGrid?: (sx: number, sy: number) => [number, number];
  // 缓存 DOM 元素避免每帧重建
  private nameEl: HTMLSpanElement;
  private detailEl: HTMLSpanElement;
  private tempEl: HTMLSpanElement;
  private descEl: HTMLSpanElement;

  constructor(canvas: HTMLCanvasElement, world: World, scale: number) {
    this.canvas = canvas;
    this.world = world;
    this.scale = scale;

    this.el = document.createElement('div');
    this.el.id = 'info-panel';
    this.el.style.display = 'none';

    this.nameEl = document.createElement('span');
    this.nameEl.className = 'info-name';
    this.detailEl = document.createElement('span');
    this.detailEl.className = 'info-detail';
    this.tempEl = document.createElement('span');
    this.tempEl.className = 'info-detail';
    this.descEl = document.createElement('span');
    this.descEl.className = 'info-desc';

    this.el.appendChild(this.nameEl);
    this.el.appendChild(this.detailEl);
    this.el.appendChild(this.tempEl);
    this.el.appendChild(this.descEl);

    document.body.appendChild(this.el);
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.screenX = e.clientX - rect.left;
      this.screenY = e.clientY - rect.top;
      this.visible = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.visible = false;
      this.el.style.display = 'none';
    });
  }

  /** 将屏幕坐标转为网格坐标（支持缩放平移） */
  private toGrid(sx: number, sy: number): [number, number] {
    if (this.screenToGrid) return this.screenToGrid(sx, sy);
    return [Math.floor(sx / this.scale), Math.floor(sy / this.scale)];
  }

  /** 根据温度返回颜色字符串（蓝→青→绿→黄→红）和标签 */
  private tempColor(temp: number): { color: string; label: string } {
    if (temp < 0) return { color: '#4fc3f7', label: '冰冻' };
    if (temp < 30) return { color: '#81d4fa', label: '冷' };
    if (temp < 100) return { color: '#aed581', label: '常温' };
    if (temp < 300) return { color: '#ffb74d', label: '热' };
    if (temp < 800) return { color: '#ff7043', label: '高温' };
    return { color: '#ef5350', label: '极高温' };
  }

  /** 每帧调用，更新面板内容 */
  update(): void {
    if (!this.visible) return;

    const [x, y] = this.toGrid(this.screenX, this.screenY);
    if (!this.world.inBounds(x, y)) {
      this.el.style.display = 'none';
      return;
    }

    const cellId = this.world.get(x, y);
    const mat = getMaterial(cellId);
    const temp = this.world.getTemp(x, y);

    if (!mat) {
      this.el.style.display = 'none';
      return;
    }

    const densityStr = mat.density === Infinity ? '∞' : mat.density.toFixed(1);
    const age = this.world.getAge(x, y);
    const ageStr = cellId === 0 ? '' : ` · 年龄: ${age}`;
    const { color: tempColor, label: tempLabel } = this.tempColor(temp);

    this.nameEl.textContent = mat.name;
    this.detailEl.textContent = `ID: ${mat.id} · 密度: ${densityStr}${ageStr}`;
    this.tempEl.textContent = `温度: ${temp.toFixed(1)}° [${tempLabel}] · (${x}, ${y})`;
    this.tempEl.style.color = tempColor;
    this.descEl.textContent = mat.description || '';
    this.descEl.style.display = mat.description ? '' : 'none';

    this.el.style.display = 'flex';
  }
}
