function loadLevel() {
	moves = 0;
	grid = new Grid(10, 10, innerHeight / 20);
	let str = LEVELS[level];
	player = new Player(grid, +str[0], +str[2]);
	str = str.substring(4);
	for (let i = 0; i < str.length; i += 2) {
		let t = i / 2;
		grid.setTile(TILES[str[i]], new Point(t % 10, Math.floor(t / 10)));
	}
}
function draw() {
	requestAnimationFrame(draw);
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	grid.draw();
	player.draw();
	ctx.fillStyle = "black";
	ctx.font = "40px monospace";
	ctx.fillText("Level " + (level + 1), 1080, 50);
	ctx.fillText("Moves: " + moves, 1080, 100);
	ctx.fillText("Press R to reset the level", 1080, 200);
	ctx.fillText("Press Enter to continue", 1080, 300);
	ctx.fillText("once you reach the goal", 1080, 350);
}
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	player.onClick();
});
addEventListener("keydown", e => {
	if (e.key == "r") loadLevel(level);
	else if (e.key == "Enter" && player.tile.win) loadLevel(++level);
});
let level = 0;
let moves = 0;
let grid;
let player;
loadLevel();
draw();