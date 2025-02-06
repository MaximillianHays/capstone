function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (inMenu) {
		menu.draw();
	} else {
		drawGame();
	}
}
function drawGame() {
	player.draw();
	let stars = "★☆☆";
	if (player.moves <= target) {
		stars = "★★★";
	} else if (player.moves <= target + 3) {
		stars = "★★☆";
	}
	let levelStr = "Level " + (level + 1) + " ";
	ctx.font = UI_FONT;
	drawText(stars, EDGE_RADIUS * 23 + ctx.measureText(levelStr).width, EDGE_RADIUS, UI_FONT, {color: "gold"});
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
		if (menuButton.hex.contains(mouse)) inMenu = true;
	}
});
addEventListener("keydown", e => {
	if (e.key == "r") loadLevel(level);
	else if (e.key == "Enter" && player.tile instanceof Goal) loadLevel(++level);
});
let menu = new Menu();
let resetButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "Reset");
let menuButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "Menu");
let inMenu = true;
draw();