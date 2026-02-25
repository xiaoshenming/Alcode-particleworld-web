import { InputHandler } from './InputHandler';
import { getAllMaterials } from '../materials/registry';
import type { MaterialDef } from '../materials/types';

/** 材质分类 */
const CATEGORIES: Record<string, number[]> = {
  '粉末': [1, 12, 15],    // 沙子、种子、雪
  '液体': [2, 5, 9, 11],  // 水、油、酸液、熔岩
  '气体': [6, 7, 8, 16, 18, 19], // 火、烟、蒸汽、雷电、毒气、氢气
  '固体': [3, 4, 10, 13, 14, 17], // 石头、木头、金属、植物、冰、玻璃
  '工具': [0],             // 空气(橡皮擦)
};

export interface ToolbarCallbacks {
  onPause: () => void;
  onClear: () => void;
  getParticleCount: () => number;
  isPaused: () => boolean;
}

/**
 * 工具栏 —— 分类材质面板 + 笔刷 + 控制按钮
 */
export class Toolbar {
  private container: HTMLElement;
  private input: InputHandler;
  private callbacks: ToolbarCallbacks;
  private particleCountEl!: HTMLSpanElement;
  private pauseBtn!: HTMLButtonElement;

  constructor(input: InputHandler, callbacks: ToolbarCallbacks) {
    this.input = input;
    this.callbacks = callbacks;
    this.container = document.createElement('div');
    this.container.id = 'toolbar';
    document.body.appendChild(this.container);
    this.build();
  }

  /** 每帧调用，更新粒子计数 */
  updateStats(): void {
    this.particleCountEl.textContent = String(this.callbacks.getParticleCount());
    this.pauseBtn.textContent = this.callbacks.isPaused() ? '继续' : '暂停';
    this.pauseBtn.classList.toggle('active', this.callbacks.isPaused());
  }

  private build(): void {
    const allMats = getAllMaterials();
    const matMap = new Map<number, MaterialDef>();
    for (const m of allMats) matMap.set(m.id, m);

    // 分类材质区
    const matsPanel = document.createElement('div');
    matsPanel.className = 'materials-panel';

    for (const [catName, ids] of Object.entries(CATEGORIES)) {
      const catDiv = document.createElement('div');
      catDiv.className = 'category';

      const catLabel = document.createElement('span');
      catLabel.className = 'category-label';
      catLabel.textContent = catName;
      catDiv.appendChild(catLabel);

      const btnsDiv = document.createElement('div');
      btnsDiv.className = 'category-btns';

      for (const id of ids) {
        const mat = matMap.get(id);
        if (!mat) continue;

        const btn = document.createElement('button');
        btn.className = 'material-btn';
        btn.textContent = mat.name;
        btn.dataset['materialId'] = String(mat.id);

        const color = mat.color();
        const r = color & 0xFF;
        const g = (color >> 8) & 0xFF;
        const b = (color >> 16) & 0xFF;
        btn.style.backgroundColor = `rgb(${r},${g},${b})`;
        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        btn.style.color = luma > 128 ? '#000' : '#fff';

        if (mat.id === this.input.getMaterial()) {
          btn.classList.add('active');
        }

        btn.addEventListener('click', () => {
          this.input.setMaterial(mat.id);
          this.container.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });

        btnsDiv.appendChild(btn);
      }

      catDiv.appendChild(btnsDiv);
      matsPanel.appendChild(catDiv);
    }
    this.container.appendChild(matsPanel);

    // 分隔线
    const sep = document.createElement('div');
    sep.className = 'toolbar-sep';
    this.container.appendChild(sep);

    // 控制区：笔刷 + 按钮 + 统计
    const controlPanel = document.createElement('div');
    controlPanel.className = 'control-panel';

    // 笔刷大小
    const brushDiv = document.createElement('div');
    brushDiv.className = 'control-row';
    const brushLabel = document.createElement('span');
    brushLabel.className = 'control-label';
    brushLabel.textContent = `笔刷: ${this.input.getBrushSize()}`;
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = String(this.input.getBrushSize());
    slider.setAttribute('aria-label', '笔刷大小');
    slider.addEventListener('input', () => {
      const size = parseInt(slider.value);
      this.input.setBrushSize(size);
      brushLabel.textContent = `笔刷: ${size}`;
    });
    brushDiv.appendChild(brushLabel);
    brushDiv.appendChild(slider);
    controlPanel.appendChild(brushDiv);

    // 按钮行
    const btnRow = document.createElement('div');
    btnRow.className = 'control-row';

    this.pauseBtn = document.createElement('button');
    this.pauseBtn.className = 'ctrl-btn';
    this.pauseBtn.textContent = '暂停';
    this.pauseBtn.addEventListener('click', () => this.callbacks.onPause());

    const clearBtn = document.createElement('button');
    clearBtn.className = 'ctrl-btn ctrl-btn-danger';
    clearBtn.textContent = '清空';
    clearBtn.addEventListener('click', () => this.callbacks.onClear());

    btnRow.appendChild(this.pauseBtn);
    btnRow.appendChild(clearBtn);
    controlPanel.appendChild(btnRow);

    // 粒子计数
    const statsDiv = document.createElement('div');
    statsDiv.className = 'control-row stats';
    const statsLabel = document.createElement('span');
    statsLabel.textContent = '粒子: ';
    this.particleCountEl = document.createElement('span');
    this.particleCountEl.textContent = '0';
    statsDiv.appendChild(statsLabel);
    statsDiv.appendChild(this.particleCountEl);
    controlPanel.appendChild(statsDiv);

    this.container.appendChild(controlPanel);
  }
}
