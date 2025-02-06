function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw();
	let tileList = "";
	for (let i = 1; i < TILES.length; i++) {
		tileList += i + ": " + TILES[i].name + "\n";
	}
	drawText(
`Current Tile: ${tile.name}
Target: ${target}
${tileList}
r: Rotate Tile
p: Set Player Position
t: Set Target Moves
e: Export to Clipboard
l: Load level`,
EDGE_RADIUS * 23, EDGE_RADIUS, UI_FONT, {spacing: 1.25});
}
function setTile() {
	if (!grid.hovered) return;
	let arg = angle;
	if (tile == Rotator) arg = arg % 2 ? 4 : 2;
	if (tile == ToggledWall) arg %= 2;
	grid.setTile(tile, grid.hovered, arg);
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
player = new Player(grid, new Vec(0, 9));
let tile = Wall;
draw();