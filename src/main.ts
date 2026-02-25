// 注册所有材质（副作用导入）
import './materials/Empty';
import './materials/Sand';

import { World } from './core/World';
import { Simulation } from './core/Simulation';
import { Renderer } from './core/Renderer';

// 网格尺寸
const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const PIXEL_SCALE = 4;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = GRID_WIDTH * PIXEL_SCALE;
canvas.height = GRID_HEIGHT * PIXEL_SCALE;

const world = new World(GRID_WIDTH, GRID_HEIGHT);
const simulation = new Simulation(world);
const renderer = new Renderer(canvas, GRID_WIDTH, GRID_HEIGHT, PIXEL_SCALE);

// 测试：在顶部中央放一堆沙子
for (let dx = -5; dx <= 5; dx++) {
  for (let dy = 0; dy < 5; dy++) {
    world.set(GRID_WIDTH / 2 + dx, dy, 1); // 1 = 沙子
  }
}

// 主循环
function loop() {
  simulation.update();
  renderer.render(world);
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
