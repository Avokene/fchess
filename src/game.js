import { Soldier } from "./objects/soldier.js";

function initWebGL() {
  // WebGL 초기화 코드
}

function gameLoop() {
  // 메인 게임 루프
  requestAnimationFrame(gameLoop);
}

initWebGL();
gameLoop();
