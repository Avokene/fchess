import { Soldier } from "./objects/soldier.js"; // Soldier 클래스를 가져옴

let gl;
let program;
let soldiers = [];
let lastTime = performance.now();
let frameTime = 0;
const updateInterval = 1000 / 60; // 60 FPS

function initWebGL() {
  const canvas = document.getElementById("glCanvas");
  gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("WebGL not supported, falling back on experimental-webgl");
    gl = canvas.getContext("experimental-webgl");
  }

  if (!gl) {
    alert("Your browser does not support WebGL");
  }

  console.log("WebGL context initialized");

  // Viewport 설정
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 배경색을 검은색으로 설정 (RGBA: 0, 0, 0, 1)
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // 초기화: 캔버스를 검은색으로 지우기
  gl.clear(gl.COLOR_BUFFER_BIT);

  // 쉐이더 초기화 (간단한 기본 쉐이더 프로그램)
  const vertexShaderSource = `
        attribute vec4 a_position;
        void main() {
            gl_Position = a_position;
        }
    `;

  const fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1, 0, 0, 1);  // 빨간색 병사
        }
    `;

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

  program = createProgram(gl, vertexShader, fragmentShader);

  // 병사들 초기화
  initSoldiers();
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
    return null;
  }

  return program;
}

function initSoldiers() {
  // 간단한 병사 생성 - 원 형태로 3명의 병사를 초기화
  soldiers.push(new Soldier(-0.5, 0, 0.3)); // 왼쪽 병사
  soldiers.push(new Soldier(0.0, 0, 0.2)); // 중간 병사
  soldiers.push(new Soldier(0.5, 0, 0.4)); // 오른쪽 병사
}

function updateSoldiers(deltaTime) {
  soldiers.forEach((soldier) => {
    soldier.move(deltaTime); // 병사의 이동을 업데이트
  });
}

function drawScene() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);

  const positionLocation = gl.getAttribLocation(program, "a_position");

  soldiers.forEach((soldier) => {
    const vertices = new Float32Array([
      soldier.x - 0.05,
      soldier.y - 0.05,
      soldier.x + 0.05,
      soldier.y - 0.05,
      soldier.x + 0.05,
      soldier.y + 0.05,
      soldier.x - 0.05,
      soldier.y + 0.05,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4); // 사각형 병사를 그림
  });
}

function gameLoop() {
  const now = performance.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  frameTime += deltaTime;

  if (frameTime >= updateInterval) {
    updateSoldiers(frameTime / 1000); // 초 단위로 변환
    frameTime = 0;
  }

  drawScene();

  requestAnimationFrame(gameLoop);
}

initWebGL();
gameLoop();
