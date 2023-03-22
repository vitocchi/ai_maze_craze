const canvas = document.getElementById("mazeCanvas");
const autoButton = document.getElementById("autoMoveBtn");
const closeModalBtn = document.getElementById("closeModalBtn");
const newMazeBtn = document.getElementById("newMazeBtn");

const ctx = canvas.getContext("2d");
const cellSize = 20;
const gridSize = 25;
const grid = [];
let startX;
let startY;
let goalX;
let goalY;
let playerY;
let playerX;

function createMaze() {
  // グリッドを初期化
  for (let y = 0; y < gridSize; y++) {
    grid[y] = [];
    for (let x = 0; x < gridSize; x++) {
      grid[y][x] = {
        visited: false,
        walls: [true, true, true, true], // 上, 右, 下, 左
      };
    }
  }

  // DFSで迷路生成
  const stack = [];
  startY = Math.floor(Math.random() * gridSize);
  startX = Math.floor(Math.random() * gridSize);
  // ゴール地点をランダムに設置
  goalY = Math.floor(Math.random() * gridSize);
  goalX = Math.floor(Math.random() * gridSize);

  // ゴール地点がスタート地点と同じ場合は再抽選
  while (goalX === startX && goalY === startY) {
    goalY = Math.floor(Math.random() * gridSize);
    goalX = Math.floor(Math.random() * gridSize);
  }

  // プレイヤーの座標を保持する変数を追加
  playerY = startY;
  playerX = startX;
  stack.push([startY, startX]);

  while (stack.length > 0) {
    const [cy, cx] = stack.pop();
    grid[cy][cx].visited = true;

    const neighbors = [
      [cy - 1, cx, 0, 2],
      [cy, cx + 1, 1, 3],
      [cy + 1, cx, 2, 0],
      [cy, cx - 1, 3, 1],
    ];

    const unvisitedNeighbors = neighbors.filter(([ny, nx]) => {
      if (ny < 0 || ny >= gridSize || nx < 0 || nx >= gridSize) return false;
      return !grid[ny][nx].visited;
    });

    if (unvisitedNeighbors.length > 0) {
      stack.push([cy, cx]);
      const [ny, nx, cw, nw] =
        unvisitedNeighbors[
          Math.floor(Math.random() * unvisitedNeighbors.length)
        ];
      grid[cy][cx].walls[cw] = false;
      grid[ny][nx].walls[nw] = false;
      stack.push([ny, nx]);
    }
  }
}

function drawMaze() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // 迷路を描画する
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = grid[y][x];
      const [topWall, rightWall, bottomWall, leftWall] = cell.walls;
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;

      if (topWall) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, y * cellSize);
        ctx.lineTo((x + 1) * cellSize, y * cellSize);
        ctx.stroke();
      }
      if (rightWall) {
        ctx.beginPath();
        ctx.moveTo((x + 1) * cellSize, y * cellSize);
        ctx.lineTo((x + 1) * cellSize, (y + 1) * cellSize);
        ctx.stroke();
      }
      if (bottomWall) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, (y + 1) * cellSize);
        ctx.lineTo((x + 1) * cellSize, (y + 1) * cellSize);
        ctx.stroke();
      }
      if (leftWall) {
        ctx.beginPath();
        ctx.moveTo(x * cellSize, y * cellSize);
        ctx.lineTo(x * cellSize, (y + 1) * cellSize);
        ctx.stroke();
      }
    }
  }
}

// スタートとゴールを描画する関数を作成
function drawStartAndGoal() {
  // スタートを描画
  ctx.fillStyle = "lime";
  ctx.fillRect(
    startX * cellSize + 1,
    startY * cellSize + 1,
    cellSize - 2,
    cellSize - 2
  );

  // ゴールを描画
  ctx.fillStyle = "red";
  ctx.fillRect(
    goalX * cellSize + 1,
    goalY * cellSize + 1,
    cellSize - 2,
    cellSize - 2
  );
}

// プレイヤーを描画する関数を追加
function drawPlayer() {
  ctx.fillStyle = "blue";
  ctx.fillRect(
    playerX * cellSize + 1,
    playerY * cellSize + 1,
    cellSize - 2,
    cellSize - 2
  );
}

// 迷路とプレイヤーを描画
function redrawMazeAndPlayer() {
  drawMaze();
  drawStartAndGoal();
  drawPlayer();
}

// キーイベントのリスナーを追加
document.addEventListener("keydown", (event) => {
  let newX = playerX;
  let newY = playerY;

  switch (event.key) {
    case "ArrowUp":
      newY--;
      break;
    case "ArrowRight":
      newX++;
      break;
    case "ArrowDown":
      newY++;
      break;
    case "ArrowLeft":
      newX--;
      break;
    default:
      return;
  }
  move(newX, newY);
});

function move(x, y) {
  if (isValidMove(playerX, playerY, x, y)) {
    playerX = x;
    playerY = y;
    redrawMazeAndPlayer();
    checkGoal();
  }
}

// プレイヤーの移動を処理する関数を実装
// 修正: isValidMove関数 (移動前の座標x1, y1を引数に追加)
function isValidMove(x1, y1, x2, y2) {
  if (x2 < 0 || x2 >= gridSize || y2 < 0 || y2 >= gridSize) {
    return false;
  }

  const currentCell = grid[y1][x1];
  const targetCell = grid[y2][x2];

  if (
    y1 > y2 &&
    currentCell.walls[0] === false &&
    targetCell.walls[2] === false
  ) {
    return true;
  }
  if (
    x1 < x2 &&
    currentCell.walls[1] === false &&
    targetCell.walls[3] === false
  ) {
    return true;
  }
  if (
    y1 < y2 &&
    currentCell.walls[2] === false &&
    targetCell.walls[0] === false
  ) {
    return true;
  }
  if (
    x1 > x2 &&
    currentCell.walls[3] === false &&
    targetCell.walls[1] === false
  ) {
    return true;
  }

  return false;
}

autoButton.addEventListener("click", () => {
  autoMovePlayer();
});

newMazeBtn.addEventListener("click", () => {
  createMaze();
  redrawMazeAndPlayer();
});

// 追加: プレイヤーを自動でゴールまで移動させる関数
async function autoMovePlayer() {
  const path = bfs(playerX, playerY, goalX, goalY);
  for (const [x, y] of path) {
    move(x, y);
    await sleep(50);
  }
}

// 追加: 幅優先探索 (Breadth-First Search; BFS) アルゴリズムを使用して経路を見つける関数
function bfs(startX, startY, goalX, goalY) {
  const visited = new Set();
  const queue = [[startX, startY, []]];

  while (queue.length > 0) {
    const [x, y, path] = queue.shift();

    if (x === goalX && y === goalY) {
      return [...path, [x, y]];
    }

    if (visited.has(`${x},${y}`)) {
      continue;
    }

    visited.add(`${x},${y}`);

    for (const [dx, dy] of [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]) {
      const newX = x + dx;
      const newY = y + dy;

      if (newX < 0 || newY < 0 || newX >= gridSize || newY >= gridSize) {
        continue;
      }

      if (!isValidMove(x, y, newX, newY)) {
        continue;
      }

      queue.push([newX, newY, [...path, [x, y]]]);
    }
  }

  return [];
}

// 追加: sleep関数 (msミリ秒待機)
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ゴールに到達したか確認する関数を実装
function checkGoal() {
  if (playerX === goalX && playerY === goalY) {
    showModal();
  }
}
// モーダルを表示する関数
function showModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
}

// モーダルを閉じる関数
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

// モーダルの閉じるボタンにイベントリスナを追加
closeModalBtn.addEventListener("click", () => {
  closeModal();
  createMaze();
  redrawMazeAndPlayer();
});

// ゲーム開始
createMaze();
redrawMazeAndPlayer();
