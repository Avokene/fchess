import { Soldier } from "./objects/soldier.js"; // Soldier 클래스를 가져옴
import { RangedSoldier } from "./objects/rangedsoldier.js"; // RangedSoldier 클래스를 가져옴

let gl;
let program;
let soldiers = [];
let lastTime = performance.now();
let frameTime = 0;
const updateInterval = 1000 / 60; // 60 FPS

// 전역 변수로 이동한 healthCanvas
const healthCanvas = document.getElementById("healthCanvas");

function initWebGL() {
  const canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl2");

  if (!gl) {
    console.error("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
    return;
  }

  console.log("WebGL context initialized");

  // Viewport 설정
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 배경색을 검은색으로 설정
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertexShaderSource = `
        attribute vec4 a_position;
        uniform mat4 u_projection;

        void main() {
            gl_Position = u_projection * a_position;
        }
    `;

  const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;

        void main() {
            gl_FragColor = u_color;
        }
    `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  program = createProgram(gl, vertexShader, fragmentShader);
  if (!program) {
    console.error("Failed to create WebGL program.");
    return; // 프로그램 생성 실패 시 종료
  }

  gl.useProgram(program);

  setProjectionMatrix();

  healthCanvas.width = window.innerWidth;
  healthCanvas.height = window.innerHeight;

  window.addEventListener("resize", () => {
    healthCanvas.width = window.innerWidth;
    healthCanvas.height = window.innerHeight;

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    setProjectionMatrix();
  });
}

function setProjectionMatrix() {
  const aspectRatio = gl.canvas.width / gl.canvas.height;
  let projectionMatrix;

  if (aspectRatio >= 1) {
    projectionMatrix = [
      1 / aspectRatio,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];
  } else {
    projectionMatrix = [
      1,
      0,
      0,
      0,
      0,
      aspectRatio,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
    ];
  }

  const uProjectionLocation = gl.getUniformLocation(program, "u_projection");
  gl.uniformMatrix4fv(
    uProjectionLocation,
    false,
    new Float32Array(projectionMatrix)
  );
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile failed:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link failed:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

function initSoldiers(numSoldiers = 3) {
  for (let i = 0; i < numSoldiers; i++) {
    const redSoldier = new Soldier(
      -0.9 + i * 0.3,
      Math.random() * 1 - 0.5,
      0.3,
      "red"
    );
    soldiers.push(redSoldier);

    const blueSoldier = new Soldier(
      0.9 - i * 0.3,
      Math.random() * 1 - 0.5,
      0.3,
      "blue"
    );
    soldiers.push(blueSoldier);
  }
}

function updateSoldiers(deltaTime) {
  const currentTime = performance.now() / 1000; // 초 단위로 현재 시간 계산

  soldiers.forEach((soldier) => {
    const closestEnemy = findClosestEnemy(soldier);
    soldier.target = closestEnemy;

    // 타겟이 범위 내에 있으면 공격 시도
    if (closestEnemy && isInRange(soldier, closestEnemy)) {
      soldier.attack(closestEnemy, currentTime);
    }

    // 타겟을 향해 이동
    soldier.moveToTarget(deltaTime);
  });

  // 죽은 병사 제거
  soldiers = soldiers.filter((s) => s.isAlive());
}

function isInRange(soldier1, soldier2) {
  const dx = soldier1.x - soldier2.x;
  const dy = soldier1.y - soldier2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 0.15;
}

function findClosestEnemy(soldier) {
  let closestEnemy = null;
  let closestDistance = Infinity;

  soldiers.forEach((enemy) => {
    if (enemy.team !== soldier.team && enemy.isAlive()) {
      const dx = soldier.x - enemy.x;
      const dy = soldier.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    }
  });

  return closestEnemy;
}

function drawHealthBar(soldier) {
  const ctx = healthCanvas.getContext("2d");
  const barWidth = 50; // 체력바 너비
  const barHeight = 8; // 체력바 높이
  const halfbarWidth = barWidth / 2; // 체력바 너비의 절반

  const healthRatio = Math.max(soldier.health / 100, 0); // 체력 비율

  // Aspect Ratio 계산
  const aspectRatio = gl.canvas.width / gl.canvas.height;

  // WebGL 좌표 -> Canvas 좌표 변환 (X 좌표에 Aspect Ratio 적용)
  const x = ((soldier.x / aspectRatio + 1) / 2) * healthCanvas.width;
  const y = (1 - (soldier.y + 1) / 2) * healthCanvas.height - 30; // Y 좌표 및 오프셋

  // 디버깅용 로그 출력
  console.log(`Canvas X: ${x}, Aspect Ratio: ${healthCanvas.width}`);

  // 체력바 배경 (회색)
  ctx.fillStyle = "gray";
  ctx.fillRect(x - halfbarWidth, y, barWidth, barHeight);

  // 현재 체력 (녹색)
  ctx.fillStyle = "green";
  ctx.fillRect(x - halfbarWidth, y, barWidth * healthRatio, barHeight);
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const ctx = healthCanvas.getContext("2d");
  ctx.clearRect(0, 0, healthCanvas.width, healthCanvas.height); // 이전 프레임의 체력바 지우기

  soldiers.forEach((soldier) => {
    const vertices = new Float32Array([
      soldier.x - soldier.size,
      soldier.y - soldier.size,
      soldier.x + soldier.size,
      soldier.y - soldier.size,
      soldier.x + soldier.size,
      soldier.y + soldier.size,
      soldier.x - soldier.size,
      soldier.y + soldier.size,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const colorLocation = gl.getUniformLocation(program, "u_color");
    gl.uniform4fv(colorLocation, new Float32Array(soldier.getColor()));

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    drawHealthBar(soldier);
  });
}

async function gameLoop() {
  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  frameTime += deltaTime;

  if (frameTime >= updateInterval) {
    await updateSoldiers(frameTime / 1000);
    frameTime = 0;
  }

  drawScene();
  requestAnimationFrame(gameLoop);
}

initWebGL();
initSoldiers(3);
gameLoop();
