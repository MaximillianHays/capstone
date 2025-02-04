function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	grid.draw();
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
	ctx.fillText(stars, grid.edgeRadius * 23 + ctx.measureText(levelStr).width, textY);
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
loadLevel(0);
draw();