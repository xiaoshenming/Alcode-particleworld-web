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

const toolbar = new Toolbar(input, {
  onPause: () => { paused = !paused; },
  onClear: () => { world.clear(); },
  getParticleCount: () => world.getParticleCount(),
  isPaused: () => paused,
});

// FPS 显示
const fpsEl = document.createElement('div');
fpsEl.id = 'fps';
document.body.appendChild(fpsEl);
let lastTime = performance.now();
let frames = 0;

function loop() {
  if (!paused) {
    simulation.update();
  }
  renderer.render(world);
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
