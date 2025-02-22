function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.fillStyle = "white";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	if (inMenu) {
		menu.draw();
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
	let tutorial = "";
	if (!level) {
		tutorial = "The red circle is you\nThe gold hex is the goal";
	} else if (level == 7) {
		tutorial = "You don't slide through sand";
	} else if (level == 14) {
		tutorial = "You bounce off mirrors";
	} else if (level == 21) {
		tutorial = "Redirectors set your direction";
	} else if (level == 24) {
		tutorial = "Some walls are toggled by switches";
	}
	ctx.font = UI_FONT;
	drawText(starStr(stars[level]), EDGE_RADIUS * 23 + ctx.measureText(levelStr).width, EDGE_RADIUS, UI_FONT, {color: "gold"});
	drawText(
`${levelStr}
Moves: ${player.moves}
Target: ${target}

Press R to reset the level

${tutorial}`,
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
		date: new Date().toISOString(),
		timeStamp: Math.floor((new Date() - new Date("2/17/2025"))) + logNumber++
	});
	if (logs.length == 25) sendLogs();
}
function sendLogs() {
	if (!logs.length) return;
	if (userID == "test") return;
	fetch("https://t7vszikxbycghcwfasvys46jhm0zpchl.lambda-url.us-west-2.on.aws/", {
		body: JSON.stringify({logs, uid: userID, sid: getSessionID(), version, area: innerHeight * innerWidth}),
		method: "POST",
		keepalive: true
	});
	logs = [];
}
function getSessionID() {
	if (!sessionStorage.getItem("sid")) sessionStorage.setItem("sid", crypto.randomUUID());
	return sessionStorage.getItem("sid");
}
function save(quit) {
	localStorage.setItem("id", userID);
	localStorage.setItem("stars", JSON.stringify(stars));
	if (quit) log({
		action: "Leave Game",
		stars: starCount(),
		moves: player?.moves,
		level
	});
	sendLogs();
}
function load() {
	if (localStorage.getItem("stars")) stars = JSON.parse(localStorage.getItem("stars"));
}
const BUTTON_Y = EDGE_RADIUS * Hex.HEIGHT_FACTOR * 18;
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	if (e.button) return;
	updateMouse(e);
	if (inMenu) {
		let hovered = menu.hovered;
		if (hovered) menu.getTile(hovered).onClick?.();
	} else {
		let reset = resetButton.hex.contains(mouse);
		let menu = menuButton.hex.contains(mouse);
		let next = nextButton.hex.contains(mouse);
		if (reset || menu || next) {
			if (player.winning) {
				log({
					action: "Finish Level",
					stars: calcStars(),
					moves: player.moves,
					level
				});
			} else if (menu) {
				log({
					action: "Exit Level",
					moves: player.moves,
					level
				});
			}
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
	if (e.altKey && e.key == "F4") save(true);
});
addEventListener("beforeunload", () => {
	save(true);
});
document.addEventListener("mouseleave", () => {
	save();
});
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState == "hidden") {
		sessionStorage.removeItem("sid");
		save();
	} else {
		load();
		if (inMenu) enterMenu();
	}
});
let resetButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Reset");
let menuButton = new Button(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Menu");
let nextButton = new Button(null, new Hex(new Vec(BOX_CENTER_X, BOX_CENTER_Y + EDGE_RADIUS * 1.5), EDGE_RADIUS), null, "lightgrey", "gold", "white", "Next");
let logs = [];
let logNumber = 0;
let userID = localStorage.getItem("id") ?? crypto.randomUUID();
let sessionID;
load();
enterMenu();
draw();