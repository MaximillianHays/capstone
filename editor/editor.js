function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	grid.draw();
	player.draw();
	ctx.fillStyle = "black";
	ctx.font = "40px monospace";
	ctx.fillText("Current Tile: " + tile.name, 1080, 30);
	ctx.fillText("1: Ice", 1080, 80);
	ctx.fillText("2: Wall", 1080, 130);
	ctx.fillText("3: Sand", 1080, 180);
	ctx.fillText("4: Goal", 1080, 230);
	ctx.fillText("5: Mirror (r to rotate)", 1080, 280);
	ctx.fillText("p: Set Player Position", 1080, 330);
	ctx.fillText("e: Export to Clipboard", 1080, 380);
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
	} else if (e.key == "e") {
		let str = "\"" + player.loc.x + " " + player.loc.y;
		for (const row of grid.grid) {
			for (const hex of row) {
				str += " " + TILES.indexOf(hex.constructor);
				str += hex.angle ?? "";
			}
		}
		navigator.clipboard.writeText(str + "\",");
	}
});
let mouseDown = false;
let angle = 0;
let grid = new Grid(10, 10, innerHeight / 20);
let player = new Player(grid, 0, 9);
let tile = Wall;
draw();