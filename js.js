const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const nextCanvas = document.getElementById("next");
const nextContext = nextCanvas.getContext("2d");

const startScreen = document.getElementById("start-screen");
const gameContainer = document.getElementById("game-container");
const scoreDisplay = document.getElementById("score-display");
const lsdisplay = document.getElementById("last-score");

const COLS = 10;
const ROWS = 20;
const BLOCK = 24;

const piece = [
	{ shape: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], color: "cyan", center: [2, 0] },
	{ shape: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], color: "red", center: [1, 1] },
	{ shape: [[0, 1], [1, 1], [2, 1], [2, 0], [3, 0]], color: "green", center: [2, 1] },
	{ shape: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]], color: "blue", center: [1, 1] },
	{ shape: [[0, 1], [1, 1], [2, 1], [3, 1], [3, 0]], color: "yellow", center: [2, 1] },
	{ shape: [[0, 0], [1, 0], [2, 0], [3, 0], [1, 1]], color: "magenta", center: [1, 0] },
	{ shape: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], color: "lime", center: [2, 1] },
	{ shape: [[0, 0], [1, 0], [0, 1], [1, 1], [0, 2]], color: "pink", center: [1, 1] },
	{ shape: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 0]], color: "orange", center: [1, 1] },
	{ shape: [[0, 0], [0, 1], [1, 1], [1, 2], [2, 2]], color: "lightblue", center: [1, 1] },
	{ shape: [[0, 0], [1, 0], [2, 0], [0, 1], [0, 2]], color: "salmon", center: [1, 1] },
	{ shape: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], color: "gold", center: [1, 1] }
];

let board, current, next, pos, over, k, score, lastScore = null;

function showLastScore() {
	if (lastScore !== null) {
		lsdisplay.textContent = `지난 게임 점수: ${lastScore}`;
	} else {
		lsdisplay.textContent = "";
	}
}

function startGame() {
	startScreen.style.display = "none";
	gameContainer.style.display = "flex";
	scoreDisplay.style.display = "block";

	board = Array.from({ length: ROWS }, () => Array(COLS).fill(""));
	current = randomPiece();
	next = randomPiece();
	pos = { x: 3, y: 0 };
	over = false;
	score = 0;
	updateScore(0);

	draw();
	drawNext();

	if (k) clearInterval(k);
	k = setInterval(drop, 1000);
}

function updateScore(a) {
	score += a;
	scoreDisplay.textContent = `점수: ${score}`;
}

function randomPiece() {
	const p = piece[Math.floor(Math.random() * piece.length)];
	return JSON.parse(JSON.stringify(p));
}

function drawBlock(ctx, x, y, color, size = BLOCK) {
	ctx.fillStyle = color;
	ctx.fillRect(x * size, y * size, size, size);
	ctx.strokeStyle = "#333";
	ctx.strokeRect(x * size, y * size, size, size);
}

function draw() {
	context.clearRect(0, 0, canvas.width, canvas.height);
	for (let y = 0; y < ROWS; y++) {
		for (let x = 0; x < COLS; x++) {
			if (board[y][x]) drawBlock(context, x, y, board[y][x]);
		}
	}
	for (let [dx, dy] of current.shape) {
		drawBlock(context, pos.x + dx, pos.y + dy, current.color);
	}
}

function drawNext() {
	nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
	const ox = 2;
	const offsetY = 2;
	for (let [x, y] of next.shape) {
		drawBlock(nextContext, x + ox, y + offsetY, next.color, 12);
	}
}

function isValidMove(dx, dy, shape = current.shape) {
	return shape.every(([x, y]) => {
		const nx = pos.x + x + dx;
		const ny = pos.y + y + dy;
		return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
	});
}

function mergePiece() {
	for (let [dx, dy] of current.shape) {
		const x = pos.x + dx, y = pos.y + dy;
		if (y < 0) gameover();
		board[y][x] = current.color;
	}
}

function clearline() {
	let lines = 0;
	for (let y = ROWS - 1; y >= 0; y--) {
		if (board[y].every(cell => cell)) {
			board.splice(y, 1);
			board.unshift(Array(COLS).fill(""));
			y++;
			lines++;
		}
	}
	if (lines > 0) {
		const points = [0, 100, 300, 500, 800][lines] || lines * 200;
		updateScore(points);
	}
}

function gameover() {
	clearInterval(k);
	over = true;
	lastScore = score;
	alert("게임 종료!");
	scoreDisplay.textContent = "점수: 0";
	gameContainer.style.display = "none";
	startScreen.style.display = "flex";
	showLastScore();
}

function drop() {
	if (over) return;
	if (isValidMove(0, 1)) {
		pos.y++;
	} else {
		mergePiece();
		clearline();
		current = next;
		next = randomPiece();
		pos = { x: 3, y: 0 };
		if (!isValidMove(0, 0)) {
			gameover();
			return;
		}
		drawNext();
	}
	draw();
}

function rotateAround(shape, center, clockwise = true) {
	const [cx, cy] = center;
	return shape.map(([x, y]) => {
		const relX = x - cx;
		const relY = y - cy;
		const [rx, ry] = clockwise ? [-relY, relX] : [relY, -relX];
		return [Math.round(rx + cx), Math.round(ry + cy)];
	});
}

function rotateA(shape, center) {
	return rotateAround(shape, center, true);
}

function rotateB(shape, center) {
	return rotateAround(shape, center, false);
}

function rotationox(shape, ox = 0) {
	return shape.every(([x, y]) => {
		const nx = pos.x + x + ox;
		const ny = pos.y + y;
		return nx >= 0 && nx < COLS && ny < ROWS && (ny < 0 || !board[ny][nx]);
	});
}

function rotate(shape) {
	const kicks = [0, -1, 1, -2, 2];
	for (let dx of kicks) {
		if (rotationox(shape, dx)) {
			current.shape = shape;
			pos.x += dx;
			return;
		}
	}
}

document.addEventListener("keydown", (e) => {
	if (over || !gameContainer.style.display.includes("flex")) return;
	if (e.key === "ArrowLeft" && isValidMove(-1, 0)) pos.x--;
	if (e.key === "ArrowRight" && isValidMove(1, 0)) pos.x++;
	if (e.key === "ArrowDown") drop();
	if (e.key === "c" || e.key === "C") {
		const rotated = rotateA(current.shape, current.center);
		rotate(rotated);
	}
	if (e.key === "z" || e.key === "Z") {
		const rotated = rotateB(current.shape, current.center);
		rotate(rotated);
	}
	draw();
});

showLastScore();