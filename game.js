function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (inMenu) {
		menu.draw();
		drawText("Level Select", EDGE_RADIUS * 11, EDGE_RADIUS * 1.5, EDGE_RADIUS * 1.5 + "px monospace", {centerX: true});
		drawText(starCount() + "★", EDGE_RADIUS * 11, EDGE_RADIUS * 10, UI_FONT, {centerX: true});
	} else {
		drawGame();
	}
}
const BOX_WIDTH = EDGE_RADIUS * 7;
const BOX_HEIGHT = EDGE_RADIUS * 6;
const BOX_X = EDGE_RADIUS * 10 - EDGE_RADIUS * 1.5;
const BOX_Y = EDGE_RADIUS * 7;
const BOX_CENTER_X = BOX_X + BOX_WIDTH / 2;
const BOX_CENTER_Y = BOX_Y + BOX_HEIGHT / 2;
function drawWinBox() {
	ctx.fillStyle = "white";
	ctx.fillRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);
	ctx.strokeStyle = "silver";
	ctx.lineWidth = 4;
	ctx.strokeRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);
	drawText(`Level ${level + 1} Completed!`, BOX_CENTER_X, BOX_Y + EDGE_RADIUS, BUTTON_FONT, {centerX: true, color: "black"});
	drawText(starStr(calcStars()), BOX_CENTER_X, BOX_Y + EDGE_RADIUS * 2, UI_FONT, {centerX: true, color: "gold"});
	nextButton.draw();
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

${level ? "" : "The red circle is you\nThe gold hex is the goal"}`,
EDGE_RADIUS * 23, EDGE_RADIUS, UI_FONT, {spacing: 1.25});
	resetButton.draw();
	menuButton.draw();
	if (player.winning) {
		stars[level] = Math.max(stars[level], calcStars());
		drawWinBox();
	}
}
function calcStars() {
	if (player.moves <= target) {
		return 3;
	} else if (player.moves <= target + 3) {
		return 2;
	}
	return 1;
}
function resetLevel() {
	log({
		action: "Reset Level",
		moves: player.moves,
		level
	});
	loadLevel(level);
}
function log(event) {
	logs.push({
		...event,
		timestamp: new Date().toISOString(),
		userID
	});
}
const BUTTON_Y = EDGE_RADIUS * Hex.HEIGHT_FACTOR * 18;
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	updateMouse(e);
	if (inMenu) {
		let hovered = menu.hovered;
		if (hovered) menu.getTile(hovered).onClick?.();
	} else {
		let reset = resetButton.hex.contains(mouse);
		let menu = menuButton.hex.contains(mouse);
		let next = nextButton.hex.contains(mouse);
		if (player.winning && (reset || menu || next)) {
			log({
				action: "Finish Level",
				stars: calcStars(),
				moves: player.moves,
				level
			});
		}
		if (reset) resetLevel();
		if (menu) enterMenu();
		if (player.winning) {
			if (next) loadLevel(level + 1, true);
		} else {
			player.onClick();
		}
	}
});
addEventListener("keydown", e => {
	if (e.key == "r") resetLevel();
});
addEventListener("beforeunload", () => {
	if (!logs.length) return;
	localStorage.setItem("id", userID);
	localStorage.setItem("stars", JSON.stringify(stars));
	fetch("https://t7vszikxbycghcwfasvys46jhm0zpchl.lambda-url.us-west-2.on.aws/", {
		body: JSON.stringify(logs),
		method: "POST",
		keepalive: true
	});
});
let resetButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Reset");
let menuButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Menu");
let nextButton = new Button(null, new Hex(new Vec(BOX_CENTER_X, BOX_CENTER_Y + EDGE_RADIUS * 1.5), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Next");
let logs = [];
let userID = localStorage.getItem("id") ?? crypto.randomUUID();
if (localStorage.getItem("stars")) stars = JSON.parse(localStorage.getItem("stars"));
enterMenu();
draw();