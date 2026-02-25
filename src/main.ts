// 注册所有材质（副作用导入）
import './materials/Empty';
import './materials/Sand';
import './materials/Water';
import './materials/Stone';
import './materials/Wood';
import './materials/Oil';
import './materials/Fire';
import './materials/Smoke';
import './materials/Steam';
import './materials/Acid';
import './materials/Metal';
import './materials/Lava';
import './materials/Seed';
import './materials/Plant';
import './materials/Ice';
import './materials/Snow';
import './materials/Lightning';
import './materials/Glass';
import './materials/Poison';
import './materials/Hydrogen';
import './materials/Dirt';
import './materials/Clay';
import './materials/Gunpowder';
import './materials/Salt';
import './materials/Saltwater';
import './materials/Wax';
import './materials/MoltenWax';
import './materials/Firework';
import './materials/Spark';

import { World } from './core/World';
import { Simulation } from './core/Simulation';
import { Renderer } from './core/Renderer';
import { InputHandler } from './ui/InputHandler';
import { Toolbar } from './ui/Toolbar';

const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const PIXEL_SCALE = 4;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = GRID_WIDTH * PIXEL_SCALE;
canvas.height = GRID_HEIGHT * PIXEL_SCALE;

const world = new World(GRID_WIDTH, GRID_HEIGHT);
const simulation = new Simulation(world);
const renderer = new Renderer(canvas, GRID_WIDTH, GRID_HEIGHT, PIXEL_SCALE);
const input = new InputHandler(canvas, world, PIXEL_SCALE);

let paused = false;
let simSpeed = 1; // 模拟速度倍率 1~5

const SAVE_KEY = 'particleworld-save';

const toolbar = new Toolbar(input, {
  onPause: () => { paused = !paused; },
  onClear: () => { world.clear(); },
  onSave: () => {
    localStorage.setItem(SAVE_KEY, world.save());
  },
  onLoad: () => {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) world.load(data);
  },
  getParticleCount: () => world.getParticleCount(),
  isPaused: () => paused,
  getSpeed: () => simSpeed,
  setSpeed: (s: number) => { simSpeed = Math.max(1, Math.min(5, s)); },
  setWind: (dir: number, strength: number) => { world.setWind(dir, strength); },
});

// 常用材质快捷键映射（数字键 1~9, 0）
const HOTKEY_MATERIALS = [1, 2, 3, 4, 6, 11, 22, 20, 5, 0]; // 沙水石木火熔岩火药泥土油橡皮

// 快捷键
document.addEventListener('keydown', (e) => {
  // Space 暂停
  if (e.code === 'Space') {
    e.preventDefault();
    paused = !paused;
    return;
  }

  // 数字键 1~9, 0 选材质
  if (e.code >= 'Digit1' && e.code <= 'Digit9') {
    const idx = parseInt(e.code.charAt(5)) - 1;
    if (idx < HOTKEY_MATERIALS.length) {
      input.setMaterial(HOTKEY_MATERIALS[idx]);
      toolbar.refreshMaterialSelection();
    }
    return;
  }
  if (e.code === 'Digit0') {
    input.setMaterial(HOTKEY_MATERIALS[9]);
    toolbar.refreshMaterialSelection();
    return;
  }

  // [ ] 调笔刷大小
  if (e.code === 'BracketLeft') {
    input.setBrushSize(input.getBrushSize() - 1);
    toolbar.refreshBrushSize();
    return;
  }
  if (e.code === 'BracketRight') {
    input.setBrushSize(input.getBrushSize() + 1);
    toolbar.refreshBrushSize();
    return;
  }

  // - = 调速度
  if (e.code === 'Minus') {
    simSpeed = Math.max(1, simSpeed - 1);
    toolbar.refreshSpeed(simSpeed);
    return;
  }
  if (e.code === 'Equal') {
    simSpeed = Math.min(5, simSpeed + 1);
    toolbar.refreshSpeed(simSpeed);
    return;
  }
});

// FPS 显示
const fpsEl = document.createElement('div');
fpsEl.id = 'fps';
document.body.appendChild(fpsEl);
let lastTime = performance.now();
let frames = 0;

function loop() {
  if (!paused) {
    for (let i = 0; i < simSpeed; i++) {
      simulation.update();
    }
  }
  renderer.render(world);

  // 笔刷预览
  if (input.cursorVisible) {
    renderer.renderBrushPreview(input.cursorX, input.cursorY, input.getBrushSize());
  }

  toolbar.updateStats();

  // FPS 计算
  frames++;
  const now = performance.now();
  if (now - lastTime >= 1000) {
    fpsEl.textContent = `${frames} FPS`;
    frames = 0;
    lastTime = now;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
