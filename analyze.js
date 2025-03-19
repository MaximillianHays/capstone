function draw() {
	requestAnimationFrame(draw);
	updateDelta();
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	player.draw(true);
	if (all) {
		for (let path of DATA[level]) {
			drawPath(path);
		}
	} else {
		drawPath(DATA[level][user]);
	}
}
function drawPath(path) {
	ctx.globalAlpha = all ? 0.1 : 0.5;
	for (let i = 0; i < path.length - 1; i++) {
		drawArrow([grid.getTile(path[i]).hex.center, grid.getTile(path[i + 1]).hex.center], 10 - 9 * i / path.length, 3, 4.5);
	}
	ctx.globalAlpha = 1;
}
addEventListener("keydown", e => {
	if (e.key == "ArrowUp") {
		level--;
	} else if (e.key == "ArrowDown") {
		level++;
	} else if (e.key == "ArrowLeft") {
		user--;
	} else if (e.key == "ArrowRight") {
		user++;
	} else if (e.key == " ") {
		all = !all;
	}
	loadLevel(level);
});
for (let level in DATA) {
	for (let path of DATA[level]) {
		for (let i = 0; i < path.length; i++) {
			path[i] = new Vec(path[i][0], path[i][1]);
		}
	}
}
let all = false;
let user = 0;
level = 0;
stars.fill(3);
loadLevel(0);
draw();