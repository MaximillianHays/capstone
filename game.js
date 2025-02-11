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
function drawWinBox(stars) {
	let boxWidth = 300, boxHeight = 200;
	let x = 300;
	let y = 200;

	ctx.fillStyle = "white";
  ctx.fillRect(x - 65, y, boxWidth, boxHeight);

	ctx.strokeStyle = "silver";
	ctx.lineWidth = 4;
	ctx.strokeRect(x - 65, y, boxWidth, boxHeight);

	ctx.fillStyle = "black";
	ctx.font = "24px Arial";
	ctx.fillText(`Level ${level + 1} Completed!`, x + 80, y + 40);

	ctx.fillStyle = "gold";
	ctx.fillText(`${stars}`, x + 80, y + 80);

	ctx.fillStyle = "pink";
	ctx.fillRect(x + 60, y + 145, 110, 40);

	ctx.fillStyle = "black";
	ctx.font = "20px Arial";
	ctx.fillText("Next Level", x + 115, y + 155);

	// Store button position
	nextLevelButton = {x: x + 100, y: y + 130, width: 100, height: 40};
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

${level ? "" : "\n\nThe red circle is you\nThe gold hex is the goal"}`,
EDGE_RADIUS * 23, EDGE_RADIUS, UI_FONT, {spacing: 1.25});
	resetButton.draw();
	menuButton.draw();
	if (win) {
		console.log("win");
		drawWinBox(stars);
}
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
		if (player.tile instanceof Goal) {
			win = true;
		}
		if (win && nextLevelButton) {
			let {x, y, width, height} = nextLevelButton;
			if (mouse.x >= x && mouse.x <= x + width && mouse.y >= y && mouse.y <= y + height) {
					console.log("Next level button clicked!");
					win = false;
					loadLevel(++level);
			}
	}
	}
});
// addEventListener("keydown", e => {
// 	if (e.key == "r") loadLevel(level);
// 	else if (e.key == "Enter" && player.tile instanceof Goal) loadLevel(++level);
// });
let win = false;
let menu = new Menu();
let resetButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "Reset");
let menuButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "Menu");
let inMenu = true;
draw();