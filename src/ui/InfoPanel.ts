import { World } from '../core/World';
import { getMaterial } from '../materials/registry';

/**
 * 材质信息面板 —— 显示光标位置的材质详情
 * 固定在画布右下角，实时更新
 */
export class InfoPanel {
  private el: HTMLElement;
  private world: World;
  private scale: number;
  private canvas: HTMLCanvasElement;
  private visible = false;
  private cursorX = -1;
  private cursorY = -1;
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
      this.cursorX = Math.floor((e.clientX - rect.left) / this.scale);
      this.cursorY = Math.floor((e.clientY - rect.top) / this.scale);
      this.visible = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.visible = false;
      this.el.style.display = 'none';
    });
  }

  /** 每帧调用，更新面板内容 */
  update(): void {
    if (!this.visible) return;

    const { cursorX: x, cursorY: y } = this;
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

    this.nameEl.textContent = mat.name;
    this.detailEl.textContent = `ID: ${mat.id} · 密度: ${densityStr}`;
    this.tempEl.textContent = `温度: ${temp.toFixed(1)}° · 坐标: (${x}, ${y})`;
    this.descEl.textContent = mat.description || '';
    this.descEl.style.display = mat.description ? '' : 'none';

    this.el.style.display = 'flex';
  }
}
