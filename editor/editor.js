function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	grid.draw();
	player.draw();
	resetText();
	drawText("Current Tile: " + tile.name);
	drawText("Target: " + target);
	drawText("1: Ice");
	drawText("2: Wall");
	drawText("3: Sand");
	drawText("4: Goal");
	drawText("5: Mirror");
	drawText("r: Rotate Tile");
	drawText("p: Set Player Position");
	drawText("t: Set Target Moves");
	drawText("e: Export to Clipboard");
	drawText("l: Load level");
}
function setTile() {
	if (grid.hovered) grid.setTile(tile, grid.hovered, angle);
}
canvas.addEventListener("pointermove", e => {
	updateMouse(e);
	if (mouseDown) setTile();
});
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	mouseDown = true;
	setTile();
});
canvas.addEventListener("pointerup", () => mouseDown = false);
addEventListener("keydown", e => {
	if (TILES[e.key]) {
		tile = TILES[e.key];
	} else if (e.key == "r") {
		angle = (angle + 1) % 6;
	} else if (e.key == "p") {
		player.loc = grid.hovered ?? player.loc;
		player.addStop();
	} else if (e.key == "t") {
		target = prompt("What is the target move count?") ?? target;
	} else if (e.key == "e") {
		let str = "\"" + player.loc.x + " " + player.loc.y;
		for (const row of grid.grid) {
			for (const hex of row) {
				str += " " + TILES.indexOf(hex.constructor);
				str += hex.angle ?? "";
			}
		}
		navigator.clipboard.writeText(str + " " + target + "\",");
	} else if (e.key == "l") {
		let id = prompt("Which level index would you like to load?");
		if (id) loadLevel(+id);
	}
});
let mouseDown = false;
let angle = 0;
player = new Player(grid, 0, 9);
let tile = Wall;
draw();