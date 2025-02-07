function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (inMenu) {
		menu.draw();
		drawText("Name goes here", EDGE_RADIUS * 11, EDGE_RADIUS * 1.5, EDGE_RADIUS * 1.5 + "px monospace", {centerX: true});
		drawText(starCount() + "★", EDGE_RADIUS * 11, EDGE_RADIUS * 10, UI_FONT, {centerX: true});
	} else {
		drawGame();
	}
}
function drawGame() {
	player.draw();
	let levelStr = "Level " + (level + 1) + " ";
	ctx.font = UI_FONT;
	drawText(starStr(calcStars()), EDGE_RADIUS * 23 + ctx.measureText(levelStr).width, EDGE_RADIUS, UI_FONT, {color: "gold"});
	drawText(
`${levelStr}
Moves: ${player.moves}
Target: ${target}

Press R to reset the level

Press Enter to continue
once you reach the goal${level ? "" : "\n\nThe red circle is you\nThe gold hex is the goal"}`,
EDGE_RADIUS * 23, EDGE_RADIUS, UI_FONT, {spacing: 1.25});
	resetButton.draw();
	menuButton.draw();
}
function calcStars() {
	if (player.moves <= target) {
		return 3;
	} else if (player.moves <= target + 3) {
		return 2;
	}
	return 1;
}
const BUTTON_Y = EDGE_RADIUS * Hex.HEIGHT_FACTOR * 18;
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	if (inMenu) {
		let hovered = menu.hovered;
		if (hovered) menu.getTile(hovered).onClick?.();
	} else {
		player.onClick();
		if (resetButton.hex.contains(mouse)) loadLevel(level);
		if (menuButton.hex.contains(mouse)) enterMenu();
	}
});
addEventListener("keydown", e => {
	if (e.key == "r") {
		loadLevel(level);
	} else if (e.key == "Enter" && player.tile instanceof Goal) {
		stars[level] = Math.max(stars[level], calcStars());
		loadLevel(level + 1);
	}
});
let resetButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Reset");
let menuButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Menu");
enterMenu();
draw();