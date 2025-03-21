const paths = [
	[new Vec(0, 9), new Vec(2, 5), new Vec(4, 9)],
	[new Vec(0, 9), new Vec(2, 5), new Vec(4, 9), new Vec(6, 5)],
	[new Vec(0, 9), new Vec(5, 0), new Vec(0, 0), new Vec(4, 9), new Vec(6, 5)],
	[new Vec(0, 9), new Vec(0, 8), new Vec(5, 8), new Vec(6, 5)],
	[new Vec(0, 9), new Vec(3, 3), new Vec(5, 6), new Vec(3, 6), new Vec(5, 2), new Vec(8, 2)],
	[new Vec(0, 9), new Vec(1, 7), new Vec(0, 7), new Vec(3, 2), new Vec(4, 2), new Vec(7, 8), new Vec(9, 3)],
];
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
function showHint() {
	ctx.strokeStyle = "white";
	let tiles = [];
	for (const i of paths[level].slice(Math.max(-numHint - 1, -paths[level].length))) {
		tiles.push(grid.getTile(i).hex.center);
	}
	drawArrow(tiles, EDGE_RADIUS / 8, 3, 4.5);
}
const BOX_WIDTH = EDGE_RADIUS * 8;
const BOX_HEIGHT = EDGE_RADIUS * 7;
const BOX_X = EDGE_RADIUS * 10 - EDGE_RADIUS * 1.5;
const BOX_Y = EDGE_RADIUS * 7;
const BOX_CENTER_X = BOX_X + BOX_WIDTH / 2;
const BOX_CENTER_Y = BOX_Y + BOX_HEIGHT / 2;
function drawWinBox() {
	if (!hasPlayedAudio) {
		const audio = new Audio('mixkit-achievement-bell-600.wav');
		audio.loop = false;
		audio.play();
		hasPlayedAudio = true; // Set the flag to true once the audio has played
	}
	ctx.fillStyle = "white";
	ctx.fillRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);
	ctx.strokeStyle = "silver";
	ctx.lineWidth = 4;
	ctx.strokeRect(BOX_X, BOX_Y, BOX_WIDTH, BOX_HEIGHT);
	drawText(`Level ${level + 1} Completed!`, BOX_CENTER_X, BOX_Y + EDGE_RADIUS, BUTTON_FONT, {centerX: true, color: "black"});
	drawText(starStr(calcStars()), BOX_CENTER_X, BOX_Y + EDGE_RADIUS * 2, STAR_FONT, {centerX: true, color: "gold"});
	nextButton.draw();
	retryButton.draw();
	menuBoxButton.draw();
}
function drawGame() {
	player.draw();
	let levelStr = "Level " + (level + 1) + " ";
	ctx.font = UI_FONT;
	drawText(starStr(stars[level]), EDGE_RADIUS * 23 + ctx.measureText(levelStr).width, EDGE_RADIUS, UI_FONT, {color: "gold"});
	drawSchema();
	drawText(
		`${levelStr}
Target: ${target}
Moves: ${player.moves}`, EDGE_RADIUS * 23, EDGE_RADIUS, UI_FONT, {spacing: 1.25});
	undoButton.draw();
	resetButton.draw();
	menuButton.draw();
	if (player.winning) {
		const pyroElement = document.querySelector('.pyro');
		pyroElement.style.display = 'block';
		stars[level] = Math.max(stars[level], calcStars());
		drawWinBox();
	}
	if ((player.moves + resetMoves) >= target * 1.5 && level < paths.length) {
		let availableHints = getAvailableHints();
		if (numHint < availableHints) {
			hintButton.draw();
 			ctx.beginPath();
 			ctx.arc(EDGE_RADIUS * 30.6, BUTTON_Y - EDGE_RADIUS * 0.8, 0.3 * EDGE_RADIUS, 0, Math.PI * 2);
 			ctx.fillStyle = "red";
 			ctx.fill();
 			drawText(`${availableHints - numHint}`, EDGE_RADIUS * 30.6, BUTTON_Y - EDGE_RADIUS * 0.84, EDGE_RADIUS * 0.5 + "px monospace", {color: "white", centerX: true, centerY: true});
		}
	}
}
function drawSchema() {
	const x = EDGE_RADIUS * 24.5;
	if (!level) {
		drawRec(x, EDGE_RADIUS * 5.5, EDGE_RADIUS * 8.6, EDGE_RADIUS * 6.2 - 5);
		ctx.beginPath();
		ctx.arc(x, EDGE_RADIUS * 7, EDGE_RADIUS / 2, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		drawText(`YOU`, EDGE_RADIUS * 26, EDGE_RADIUS * 6.8, UI_FONT);
		drawHex(x, EDGE_RADIUS * 9, "WALL", "black");
		drawHex(x, EDGE_RADIUS * 11.2, "ICE", "skyblue");
		drawHex(x, EDGE_RADIUS * 13.4, "GOAL", "gold");
	} else {
		if (level == 3) {
			drawRec(x, EDGE_RADIUS * 7, EDGE_RADIUS * 4, EDGE_RADIUS * 9 - 5);
			drawText(`You stop at`, x - EDGE_RADIUS, EDGE_RADIUS * 9.5, UI_FONT);
			drawHex(x, EDGE_RADIUS * 11.4, "SAND", "#ff7");
		} else if (level == 14) {
			drawRec(x, EDGE_RADIUS * 8, EDGE_RADIUS * 4, EDGE_RADIUS * 9 - 5);
			drawText(`You bounce off`, x - EDGE_RADIUS, EDGE_RADIUS * 9.5, UI_FONT);
			drawText("MIRRORS", EDGE_RADIUS * 26, EDGE_RADIUS * 11.4 - 0.3 * EDGE_RADIUS, UI_FONT);
			ctx.beginPath();
			for (let i = 5; i < 9; i++) {
				const angle = Math.PI * (i / 3) + Math.PI / 6;
				ctx.lineTo(x + EDGE_RADIUS * Math.cos(angle), EDGE_RADIUS * 11.4 + EDGE_RADIUS * Math.sin(angle));
			}
			ctx.closePath();
			ctx.fillStyle = "black";
			ctx.fill();
			ctx.beginPath();
			let angle = Math.PI * (5 / 3) + Math.PI / 6;
			ctx.moveTo(x + EDGE_RADIUS * Math.cos(angle), EDGE_RADIUS * 11.4 + EDGE_RADIUS * Math.sin(angle));
			angle = Math.PI * (8 / 3) + Math.PI / 6;
			ctx.lineTo(x + EDGE_RADIUS * Math.cos(angle), EDGE_RADIUS * 11.4 + EDGE_RADIUS * Math.sin(angle));
			ctx.strokeStyle = "red";
			ctx.lineWidth = 2;
			ctx.stroke();
			ctx.fill();
		} else if (level == 21) {
			drawRec(x, EDGE_RADIUS * 11, EDGE_RADIUS * 4, EDGE_RADIUS * 9 - 5);
			drawText(`Change direction with`, x - EDGE_RADIUS, EDGE_RADIUS * 9.5, UI_FONT);
			drawText("REDIRECTORS", EDGE_RADIUS * 26, EDGE_RADIUS * 11.4 - 0.3 * EDGE_RADIUS, UI_FONT);
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.moveTo(x, EDGE_RADIUS * 11.4);
			let angle = Math.PI * (3 / 3) + Math.PI / 6;
			ctx.lineTo(x + EDGE_RADIUS * Math.cos(angle), EDGE_RADIUS * 11.4 + EDGE_RADIUS * Math.sin(angle));
			angle = Math.PI * (4 / 6) + Math.PI / 6;
			ctx.lineTo(x + EDGE_RADIUS * Math.cos(angle), EDGE_RADIUS * 11.4 + EDGE_RADIUS * Math.sin(angle));
			ctx.closePath();
			ctx.fill();
		} else if (level == 24) {
			drawRec(x, EDGE_RADIUS * 9, EDGE_RADIUS * 4, EDGE_RADIUS * 9 - 5);
			drawText(`Toggle walls with`, x - EDGE_RADIUS, EDGE_RADIUS * 9.5, UI_FONT);
			drawHex(x, EDGE_RADIUS * 11.4, "SWITCHES", "violet", 0.5);
		}
	}
}
function drawRec(x, rectWidth, rectHeight, rectY) {
	const padding = 5;
	const rectX = x - EDGE_RADIUS * 1.3 - padding;
	const radius = 10;

	ctx.beginPath();
	ctx.moveTo(rectX + radius, rectY);
	ctx.arcTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + rectHeight, radius);
	ctx.arcTo(rectX + rectWidth, rectY + rectHeight, rectX, rectY + rectHeight, radius);
	ctx.arcTo(rectX, rectY + rectHeight, rectX, rectY, radius);
	ctx.arcTo(rectX, rectY, rectX + rectWidth, rectY, radius);

	ctx.fillStyle = "#E7F5FB";
	ctx.fill();
	ctx.closePath();
}
function drawHex(centerX, centerY, name, color, factor = 1) {
	ctx.beginPath();
	for (let i = 0; i < 6; i++) {
		const angle = Math.PI * (i / 3) + Math.PI / 6;
		ctx.lineTo(centerX + factor * EDGE_RADIUS * Math.cos(angle), centerY + factor * EDGE_RADIUS * Math.sin(angle));
	}
	ctx.closePath();
	ctx.fillStyle = color;
	ctx.fill();
	drawText(name, EDGE_RADIUS * 26, centerY - 0.3 * EDGE_RADIUS, UI_FONT);
}
function calcStars() {
	if (player.moves <= target) {
		return 3;
	} else if (player.moves <= target + 3) {
		return 2;
	}
	return 1;
}
function getAvailableHints() {
	if (level >= paths.length) return 0;
	return Math.min(Math.floor((resetMoves + player.moves) / (target * 1.5)), paths[level].length - 1);
}
function resetLevel() {
	let moves = resetMoves + player.moves;
	log({
		action: "Reset Level",
		moves: player.moves,
		moveLog: JSON.stringify(player.moveLog),
		level
	});
	loadLevel(level);
	resetMoves = moves;
}
function enterMenu() {
	inMenu = true;
	menu = new Menu();
}
function log(event) {
	// logs.push({
	// 	...event,
	// 	date: new Date().toISOString(),
	// 	timeStamp: Math.floor(new Date()) + logNumber++
	// });
	// if (logs.length == 25) sendLogs();
}
function sendLogs() {
	// if (!logs.length) return;
	// if (userID == "test") return;
	// {
	// body: JSON.stringify({logs, uid: userID, sid: getSessionID(), version, iVersion: +localStorage.getItem("initialVersion"), area: innerHeight * innerWidth, undo: localStorage.getItem("undo")}),
	// 	method: "POST",
	// 	keepalive: true
	// }
	// logs = [];
}
function startSession() {
	log({
		action: "Start Session",
		stars: starCount()
	});
}
function getSessionID() {
	if (!sessionStorage.getItem("sid")) sessionStorage.setItem("sid", crypto.randomUUID());
	return sessionStorage.getItem("sid");
}
function save() {
	localStorage.setItem("id", userID);
	localStorage.setItem("stars", JSON.stringify(stars));
	sendLogs();
}
function load() {
	if (localStorage.getItem("stars")) stars = JSON.parse(localStorage.getItem("stars"));
}
const BUTTON_Y = EDGE_RADIUS * Hex.HEIGHT_FACTOR * 20;
canvas.addEventListener("pointermove", updateMouse);
canvas.addEventListener("pointerdown", e => {
	if (e.button) return;
	updateMouse(e);
	if (inMenu) {
		let hovered = menu.hovered;
		if (hovered) menu.getTile(hovered).onClick?.();
	} else {
		let reset = resetButton.hex.contains(mouse) || (player.winning && retryButton.hex.contains(mouse));
		let menu = menuButton.hex.contains(mouse) || (player.winning && menuBoxButton.hex.contains(mouse));
		let next = nextButton.hex.contains(mouse);
		let undo = undoButton.hex.contains(mouse);
		let hint = hintButton.hex.contains(mouse);
		if (reset || menu || next) {
			if (player.winning) {
				if (next || menu || reset) {
					const pyroElement = document.querySelector('.pyro');
					pyroElement.style.display = 'none';
				}
				log({
					action: "Finish Level",
					stars: calcStars(),
					moves: player.moves,
					moveLog: JSON.stringify(player.moveLog),
					level
				});
			} else if (menu) {
				log({
					action: "Exit Level",
					moves: player.moves,
					moveLog: JSON.stringify(player.moveLog),
					level
				});
			}
		}
		if (reset) resetLevel();
		if (menu) enterMenu();
		if (player.winning) {
			if (next) {
				if (!loadLevel(level + 1, true)) {
					if (!loadLevel(level + 2, true)) enterMenu();
				}
			}
		} else if (hint && getAvailableHints() - numHint) {
			log({
				action: "Get Hint",
				moves: player.moves,
				moveLog: JSON.stringify(player.moveLog),
				level
			});
			numHint++;
		} else if (undo && player.history.length) {
			let temp = player.history.at(-1);
			temp.moveLog = [...player.moveLog, player.moveLog.at(-2)];
			player = temp;
		} else {
			player.onClick();
		}
	}
});
addEventListener("keydown", e => {
	if (e.key == "r") resetLevel();
	if (e.altKey && e.key == "F4") save();
});
addEventListener("beforeunload", save);
document.addEventListener("mouseleave", save);
document.addEventListener("visibilitychange", () => {
	if (document.visibilityState == "hidden") {
		log({
			action: "End Session",
			moves: player?.moves,
			moveLog: JSON.stringify(player?.moveLog),
			level
		});
		sendLogs();
		sessionStorage.removeItem("sid");
		save();
	} else {
		load();
		startSession();
		if (inMenu) enterMenu();
	}
});
let undoButton = new IconButton(null, new Hex(new Vec(EDGE_RADIUS * 24, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "⤺");
let resetButton = new IconButton(null, new Hex(new Vec(EDGE_RADIUS * 26, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "↺");
let menuButton = new IconButton(null, new Hex(new Vec(EDGE_RADIUS * 28, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "≡");
let hintButton = new IconButton(null, new Hex(new Vec(EDGE_RADIUS * 30, BUTTON_Y), EDGE_RADIUS), null, "lightgrey", "gold", "white", "💡");
let nextButton = new IconButton(null, new Hex(new Vec(BOX_CENTER_X + EDGE_RADIUS * 2, BOX_CENTER_Y + EDGE_RADIUS * 2), EDGE_RADIUS), null, "lightgrey", "gold", "white", "➜");
let retryButton = new IconButton(null, new Hex(new Vec(BOX_CENTER_X, BOX_CENTER_Y + EDGE_RADIUS * 2), EDGE_RADIUS), null, "lightgrey", "gold", "white", "↻");
let menuBoxButton = new IconButton(null, new Hex(new Vec(BOX_CENTER_X - EDGE_RADIUS * 2, BOX_CENTER_Y + EDGE_RADIUS * 2), EDGE_RADIUS), null, "lightgrey", "gold", "white", "≡");
let logs = [];
let logNumber = 0;
let userID = localStorage.getItem("id") ?? crypto.randomUUID();
let hasPlayedAudio = false;
load();
startSession();
if (stars[0]) enterMenu();
else loadLevel(0);
draw();
