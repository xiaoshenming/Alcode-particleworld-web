import { InputHandler } from './InputHandler';
import { getAllMaterials } from '../materials/registry';
import type { MaterialDef } from '../materials/types';

/** 材质分类 */
const CATEGORIES: Record<string, number[]> = {
  '粉末': [1, 12, 15, 20, 22],    // 沙子、种子、雪、泥土、火药
  '液体': [2, 5, 9, 11],  // 水、油、酸液、熔岩
  '气体': [6, 7, 8, 16, 18, 19], // 火、烟、蒸汽、雷电、毒气、氢气
  '固体': [3, 4, 10, 13, 14, 17, 21], // 石头、木头、金属、植物、冰、玻璃、黏土
  '工具': [0],             // 空气(橡皮擦)
};

export interface ToolbarCallbacks {
  onPause: () => void;
  onClear: () => void;
  onSave: () => void;
  onLoad: () => void;
  getParticleCount: () => number;
  isPaused: () => boolean;
  getSpeed: () => number;
  setSpeed: (speed: number) => void;
  setWind: (dir: number, strength: number) => void;
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
  private brushLabel!: HTMLSpanElement;
  private brushSlider!: HTMLInputElement;
  private speedLabel!: HTMLSpanElement;
  private speedSlider!: HTMLInputElement;

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

  /** 刷新材质选中状态（快捷键切换后调用） */
  refreshMaterialSelection(): void {
    const currentId = this.input.getMaterial();
    this.container.querySelectorAll('.material-btn').forEach(b => {
      const btn = b as HTMLButtonElement;
      btn.classList.toggle('active', btn.dataset['materialId'] === String(currentId));
    });
  }

  /** 刷新笔刷大小显示 */
  refreshBrushSize(): void {
    const size = this.input.getBrushSize();
    this.brushLabel.textContent = `笔刷: ${size}`;
    this.brushSlider.value = String(size);
  }

  /** 刷新速度显示 */
  refreshSpeed(speed: number): void {
    this.speedLabel.textContent = `速度: ${speed}x`;
    this.speedSlider.value = String(speed);
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
        btn.dataset['materialId'] = String(mat.id);

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
    this.brushLabel = brushLabel;
    this.brushSlider = slider;
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

    // 存档按钮行
    const saveRow = document.createElement('div');
    saveRow.className = 'control-row';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ctrl-btn';
    saveBtn.textContent = '保存';
    saveBtn.addEventListener('click', () => this.callbacks.onSave());

    const loadBtn = document.createElement('button');
    loadBtn.className = 'ctrl-btn';
    loadBtn.textContent = '加载';
    loadBtn.addEventListener('click', () => this.callbacks.onLoad());

    saveRow.appendChild(saveBtn);
    saveRow.appendChild(loadBtn);
    controlPanel.appendChild(saveRow);

    // 模拟速度
    const speedDiv = document.createElement('div');
    speedDiv.className = 'control-row';
    const speedLabel = document.createElement('span');
    speedLabel.className = 'control-label';
    speedLabel.textContent = `速度: ${this.callbacks.getSpeed()}x`;
    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '5';
    speedSlider.value = String(this.callbacks.getSpeed());
    speedSlider.setAttribute('aria-label', '模拟速度');
    speedSlider.addEventListener('input', () => {
      const speed = parseInt(speedSlider.value);
      this.callbacks.setSpeed(speed);
      speedLabel.textContent = `速度: ${speed}x`;
    });
    this.speedLabel = speedLabel;
    this.speedSlider = speedSlider;
    speedDiv.appendChild(speedLabel);
    speedDiv.appendChild(speedSlider);
    controlPanel.appendChild(speedDiv);

    // 风力控制
    const windDiv = document.createElement('div');
    windDiv.className = 'control-row';
    const windLabel = document.createElement('span');
    windLabel.className = 'control-label';
    windLabel.textContent = '风力: 无';
    const windSlider = document.createElement('input');
    windSlider.type = 'range';
    windSlider.min = '-5';
    windSlider.max = '5';
    windSlider.value = '0';
    windSlider.setAttribute('aria-label', '风力方向与强度');
    windSlider.addEventListener('input', () => {
      const val = parseInt(windSlider.value);
      if (val === 0) {
        windLabel.textContent = '风力: 无';
        this.callbacks.setWind(0, 0);
      } else {
        const dir = val > 0 ? 1 : -1;
        const strength = Math.abs(val) / 5;
        const arrow = dir > 0 ? '→' : '←';
        windLabel.textContent = `风力: ${arrow} ${Math.abs(val)}`;
        this.callbacks.setWind(dir, strength);
      }
    });
    windDiv.appendChild(windLabel);
    windDiv.appendChild(windSlider);
    controlPanel.appendChild(windDiv);

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

    // 快捷键提示
    const helpDiv = document.createElement('div');
    helpDiv.className = 'toolbar-sep';
    this.container.appendChild(helpDiv);
    const keysDiv = document.createElement('div');
    keysDiv.className = 'control-row stats';
    keysDiv.textContent = 'Space 暂停 · 1~0 材质 · [] 笔刷 · -/= 速度';
    this.container.appendChild(keysDiv);

    // 监听滚轮笔刷变化同步滑块
    const canvasEl = document.querySelector('#canvas');
    if (canvasEl) {
      canvasEl.addEventListener('brushchange', ((e: CustomEvent) => {
        slider.value = String(e.detail);
        brushLabel.textContent = `笔刷: ${e.detail}`;
      }) as EventListener);
    }
  }
}
