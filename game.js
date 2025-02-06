function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw();
	let stars = "★☆☆";
	if (moves <= target) {
		stars = "★★★";
	} else if (moves <= target + 3) {
		stars = "★★☆";
	}
	let levelStr = "Level " + (level + 1) + " ";
	resetText();
	drawText(levelStr);
	ctx.fillStyle = "gold";
	ctx.fillText(stars, EDGE_RADIUS * 23 + ctx.measureText(levelStr).width, textY);
	ctx.fillStyle = "black";
	drawText("Moves: " + moves);
	drawText("Target: " + target);
	drawText("");
	drawText("Press R to reset the level");
	drawText("");
	drawText("Press Enter to continue");
	drawText("once you reach the goal");
	drawText("");
	if (level == 0) {
		drawText("The red circle is you");
		drawText("The gold hex is the goal");
	} else if (level == 6) {
		drawText("You bounce off of mirrors");
	} else if (level == 13) {
		drawText("You don't slide past sand");
	}
	ctx.fillStyle = resetButton.contains(mouse) ? "gold" : "lightgrey";
	resetButton.draw("fill");
	ctx.fillStyle = menuButton.contains(mouse) ? "gold" : "lightgrey";
	menuButton.draw("fill");
	ctx.fillStyle = "black";
	resetButton.drawText("Reset");
	menuButton.drawText("Menu");
}
function getButtonY() {
	return EDGE_RADIUS * Hex.HEIGHT_FACTOR * 18;
}
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	player.onClick();
	if (resetButton.contains(mouse)) loadLevel(level);
});
addEventListener("keydown", e => {
	if (e.key == "r") loadLevel(level);
	else if (e.key == "Enter" && player.tile.win) loadLevel(++level);
});
let resetButton = new Hex(new Vec(EDGE_RADIUS * 24, getButtonY()), EDGE_RADIUS);
let menuButton = new Hex(new Vec(EDGE_RADIUS * 26 + 2, getButtonY()), EDGE_RADIUS);
let level = 0;
let moves = 0;
loadLevel(0);
draw();