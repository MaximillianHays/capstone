function draw() {
	requestAnimationFrame(draw);
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
	ctx.fillText("p: Set Player Position", 1080, 280);
	ctx.fillText("e: Export to Clipboard", 1080, 330);
}
canvas.addEventListener("pointermove", e => {
	updateMouse(e);
	if (mouseDown && grid.hovered) grid.setTile(tile, grid.hovered);
});
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	mouseDown = true;
	if (grid.hovered) grid.setTile(tile, grid.hovered);
});
canvas.addEventListener("pointerup", () => mouseDown = false);
addEventListener("keydown", e => {
	if (TILES[e.key]) {
		tile = TILES[e.key];
	} else if (e.key == "p") {
		player.loc = grid.hovered ?? player.loc;
	} else if (e.key == "e") {
		let str = "\"" + player.loc.x + " " + player.loc.y;
		for (const row of grid.grid) {
			for (const hex of row) {
				str += " " + TILES.indexOf(hex.constructor);
			}
		}
		navigator.clipboard.writeText(str + "\",");
	}
});
let mouseDown = false;
let grid = new Grid(10, 10, innerHeight / 20);
let player = new Player(grid, 0, 9);
let tile = Wall;
draw();