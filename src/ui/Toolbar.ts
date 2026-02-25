import { InputHandler } from './InputHandler';
import { getAllMaterials } from '../materials/registry';

/**
 * 工具栏 —— 材质选择 + 笔刷大小
 */
export class Toolbar {
  private container: HTMLElement;
  private input: InputHandler;

  constructor(input: InputHandler) {
    this.input = input;
    this.container = document.createElement('div');
    this.container.id = 'toolbar';
    document.body.appendChild(this.container);
    this.build();
  }

  private build(): void {
    // 材质按钮区
    const materialsDiv = document.createElement('div');
    materialsDiv.className = 'toolbar-section';

    const materials = getAllMaterials();
    for (const mat of materials) {
      const btn = document.createElement('button');
      btn.className = 'material-btn';
      btn.textContent = mat.name;
      btn.dataset['materialId'] = String(mat.id);

      // 用材质颜色做按钮背景
      const color = mat.color();
      const r = color & 0xFF;
      const g = (color >> 8) & 0xFF;
      const b = (color >> 16) & 0xFF;
      btn.style.backgroundColor = `rgb(${r},${g},${b})`;
      // 浅色背景用深色文字
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

      materialsDiv.appendChild(btn);
    }
    this.container.appendChild(materialsDiv);

    // 笔刷大小
    const brushDiv = document.createElement('div');
    brushDiv.className = 'toolbar-section';

    const label = document.createElement('span');
    label.className = 'brush-label';
    label.textContent = `笔刷: ${this.input.getBrushSize()}`;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '1';
    slider.max = '10';
    slider.value = String(this.input.getBrushSize());
    slider.addEventListener('input', () => {
      const size = parseInt(slider.value);
      this.input.setBrushSize(size);
      label.textContent = `笔刷: ${size}`;
    });

    brushDiv.appendChild(label);
    brushDiv.appendChild(slider);
    this.container.appendChild(brushDiv);
  }
}
