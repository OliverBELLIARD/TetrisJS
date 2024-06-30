const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

/////////////////////////////////////////////////////////////////
/////////////////////// GAME CONSTANTS //////////////////////////
/////////////////////////////////////////////////////////////////
// Dimensions: scale
const scale = 20;
// Canvas scaling
ctx.scale(scale, scale);

// Canvas normalized dimensions
const tWidth = canvas.clientWidth / scale;
const tHeight = canvas.clientHeight / scale;

// Game elements
const pieces = [
	[
		[1, 1],
		[1, 1],
	],
	[
		[0, 2, 0, 0],
		[0, 2, 0, 0],
		[0, 2, 0, 0],
		[0, 2, 0, 0],
	],
	[
		[0, 0, 0],
		[3, 3, 0],
		[0, 3, 3],
	],
	[
		[0, 0, 0],
		[0, 4, 4],
		[4, 4, 0],
	],
	[
		[5, 0, 0],
		[5, 0, 0],
		[5, 5, 0],
	],
	[
		[0, 0, 6],
		[0, 0, 6],
		[0, 6, 6],
	],
	[
		[0, 0, 0],
		[7, 7, 7],
		[0, 7, 0],
	],
];
const colors = [
	null,
	"red",
	"blue",
	"violet",
	"orange",
	"purple",
	"pink",
	"green",
];

arena = [];

const player = {
	pos: { x: 0, y: 0 },
	matrix: null,
	color: null,
};

let rand;
rand = Math.floor(Math.random() * pieces.length);
player.matrix = pieces[rand];
player.color = colors[rand + 1];

const defaultInterval = 1000;
let interval = 1000;
let lastTime = 0;
let count = 0;

/////////////////////////////////////////////////////////////////
/////////////////////// GAME FUNCTIONS //////////////////////////
/////////////////////////////////////////////////////////////////

function drawMatrix(matrix, color, x, y) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			if (matrix[i][j]) {
				ctx.fillStyle = color;
				ctx.fillRect(x + j, y + i, 1, 1);
			}
		}
	}
}

function rotateMatrix(matrix, dir) {
	let newMatrix = [];

	for (let i in matrix) newMatrix.push([]);

	if (dir === 1) {
		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				newMatrix[j][matrix.length - i - 1] = matrix[i][j];
			}
		}
	} else {
		for (let i = 0; i < matrix.length; i++) {
			for (let j = 0; j < matrix[i].length; j++) {
				newMatrix[matrix.length - j - 1][i] = matrix[i][j];
			}
		}
	}

	return newMatrix;
}

function collides(player, arena) {
	for (let i = 0; i < player.matrix.length; i++) {
		for (let j = 0; j < player.matrix[i].length; j++) {
			if (
				player.matrix[i][j] &&
				arena[player.pos.y + i + 1][player.pos.x + j + 1]
			) {
				return 1;
			}
		}
	}

	return 0;
}

function mergeArena(matrix, x, y) {
	for (let i = 0; i < matrix.length; i++) {
		for (let j = 0; j < matrix[i].length; j++) {
			arena[y + i + 1][x + j + 1] = arena[y + i + 1][x + j + 1] || matrix[i][j];
		}
	}
}

function clearBlocks() {
	for (let i = 0; i < arena.length - 2; i++) {
		let clear = 1;

		for (let j = 0; j < arena[i].length - 1; j++) {
			if (!arena[i][j]) clear = 0;
		}

		if (clear) {
			let r = new Array(tWidth).fill(0);
			r.push(1);
			r.unshift(1);

			arena.splice(i, 1);
			arena.splice(1, 0, r);
		}
	}
}

function drawArena() {
	for (let i = 1; i < arena.length - 2; i++) {
		for (let j = 1; j < arena[i].length - 1; j++) {
			if (arena[i][j]) {
				ctx.fillStyle = colors[arena[i][j]];
				ctx.fillRect(j - 1, i - 1, 1, 1);
			}
		}
	}
}

function drawGrid() {
	ctx.strokeStyle = "#707070";
	ctx.lineWidth = 0.01;

	for (let i = 0; i < tWidth; i++) {
		for (let j = 0; j < tHeight; j++) {
			if (1 + (i % 2) && 1 + (j % 2)) {
				ctx.beginPath();
				ctx.strokeRect(i, j, 1, 1);
			}
		}
	}
}

const maxSpeed = 850; // < 1000
let speed = 0;

function initArena() {
	arena = [];
	speed = 0;
	playedPieces = 0;

	const r = new Array(tWidth + 2).fill(1);
	arena.push(r);

	for (let i = 0; i < tHeight; i++) {
		let row = new Array(tWidth).fill(0);
		row.push(1);
		row.unshift(1);

		arena.push(row);
	}

	arena.push(r);
	arena.push(r);
}

function gameOver() {
	for (let j = 1; j < arena[1].length - 1; j++)
		if (arena[1][j]) return initArena();

	return;
}

let playedPieces = 0;

// update function: game loop, updates each frame
function update(time = 0) {
	const dt = time - lastTime;
	lastTime = time;
	count += dt;

	if (count >= interval) {
		player.pos.y++;
		count = 0;
	}

	if (collides(player, arena)) {
		mergeArena(player.matrix, player.pos.x, player.pos.y - 1);
		clearBlocks();
		gameOver();

		player.pos.x = 4;
		player.pos.y = 0;

		rand = Math.floor(Math.random() * pieces.length);
		player.matrix = pieces[rand];
		player.color = colors[rand + 1];
		playedPieces++;

		// Speed computing
		speed = (Math.log(playedPieces) * maxSpeed) / 7;
		// Reset interval delay to default value
		if (speed >= maxSpeed) interval = defaultInterval - maxSpeed;
		else interval = defaultInterval - speed;
	}
	// Draw background
	ctx.fillStyle = "black";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	// Draw player tetramino
	drawArena();
	drawMatrix(player.matrix, player.color, player.pos.x, player.pos.y);

	// Draw grid
	drawGrid();
	// Update next frame
	requestAnimationFrame(update);
}

/////////////////////////////////////////////////////////////////
///////////////////////// GAME INPUTS ///////////////////////////
/////////////////////////////////////////////////////////////////
document.addEventListener("keydown", (event) => {
	if (event.keyCode === 37 && interval - 1) {
		// On arow left key pressed
		player.pos.x--;
		if (collides(player, arena)) player.pos.x++;
	} else if (event.keyCode === 39 && interval - 1) {
		// On arow right key pressed
		player.pos.x++;
		if (collides(player, arena)) player.pos.x--;
	} else if (event.keyCode === 38) {
		// On arow up key pressed
		// TODO: repare rotation on the edges
		player.matrix = rotateMatrix(player.matrix, 1);
		if (collides(player, arena)) {
			player.matrix = rotateMatrix(player.matrix, -1);
		}
	} else if (event.keyCode === 40) {
		// On arow down key pressed
		player.pos.y++;
		count = 0;
	} else if (event.keyCode === 32) {
		// On space key pressed
		interval = 1; // Speed up the game
	}
});

/////////////////////////////////////////////////////////////////
///////////////////// GAME INITIALIZATION ///////////////////////
/////////////////////////////////////////////////////////////////
initArena();
update();
