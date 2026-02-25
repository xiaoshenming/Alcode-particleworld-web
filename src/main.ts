import { Renderer } from './core/Renderer';

// 网格尺寸
const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
// 每个像素的显示大小
const PIXEL_SCALE = 4;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
canvas.width = GRID_WIDTH * PIXEL_SCALE;
canvas.height = GRID_HEIGHT * PIXEL_SCALE;

const renderer = new Renderer(canvas, GRID_WIDTH, GRID_HEIGHT, PIXEL_SCALE);

// 主循环
function loop() {
  renderer.render();
  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
