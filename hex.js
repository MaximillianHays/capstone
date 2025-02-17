class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	get normal() {
		return new Vec(-this.y, this.x);
	}
	get length() {
		return Math.hypot(this.x, this.y);
	}
	withLength(length) {
		let thisLength = this.length;
		if (!thisLength) return new Vec(0, 0);
		return this.scale(length / thisLength);
	}
	add(other) {
		return new Vec(this.x + other.x, this.y + other.y);
	}
	sub(other) {
		return new Vec(this.x - other.x, this.y - other.y);
	}
	scale(factor) {
		return new Vec(this.x * factor, this.y * factor);
	}
	dist(other) {
		return this.sub(other).length;
	}
	equals(other) {
		return Math.abs(this.x - other.x) < EPSILON && Math.abs(this.y - other.y) < EPSILON;
	}
	copy() {
		return new Vec(this.x, this.y);
	}
	invert() {
		return new Vec(-this.x, -this.y);
	}
}
class Hex {
	static HEIGHT_FACTOR = Math.cos(Math.PI / 6);
	constructor(center, edgeRadius) {
		this.center = center;
		this.edgeRadius = edgeRadius;
		this.radius = edgeRadius / Hex.HEIGHT_FACTOR;
	}
	get points() {
		let points = [];
		for (let i = 0; i < 6; i++) {
			let angle = Math.PI * (i / 3 + 1 / 6);
			points.push(new Vec(
				this.center.x + this.radius * Math.cos(angle),
				this.center.y + this.radius * Math.sin(angle)
			));
		}
		return points;
	}
	get edges() {
		let points = this.points;
		let edges = [];
		for (let i = 0; i < 6; i++) {
			edges.push([points[i], points[(i + 1) % 6]]);
		}
		return edges;
	}
	contains(point) {
		let edges = this.edges;
		for (const [a, b] of edges) {
			let dx = a.y - b.y;
			let dy = b.x - a.x;
			if (point.x * dx + point.y * dy < a.x * dx + a.y * dy) {
				return false;
			}
		}
		return true;
	}
	draw(fill, x = 1, y = 1) {
		let points = this.points;
		if (x != 1 || y != 1) {
			ctx.save();
			ctx.translate(this.center.x, this.center.y);
			ctx.scale(x, y);
			ctx.translate(-this.center.x, -this.center.y);
		}
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < 6; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
		ctx[fill]();
		if (x != 1 || y != 1) ctx.restore();
	}
	drawText(str, ...args) {
		drawText(str, this.center.x, this.center.y, ...args);
	}
	drawImage(src, x, y) {
		ctx.save();
		this.draw("clip", x, y);
		drawImage(src, this.center.x - this.edgeRadius, this.center.y - this.edgeRadius, this.edgeRadius * 2, this.edgeRadius * 2);
		ctx.restore();
	}
}
const DIRECTIONS = [new Vec(1, -1), new Vec(1, 0), new Vec(1, 1), new Vec(-1, 1), new Vec(-1, 0), new Vec(-1, -1)];
class Tile {
	constructor(grid, hex, loc) {
		this.grid = grid;
		this.hex = hex;
		this.loc = loc;
	}
	get adjacency() {
		let pairs = [];
		for (const dir of DIRECTIONS) {
			let ai = Grid.adjacentIndex(this.loc, dir);
			let tile = this.grid.getTile(ai);
			if (tile && !tile.isStop(dir)) {
				pairs.push([tile, dir]);
			}
		}
		return pairs;
	}
	onEnter() {}
	newDirection(dir) {
		return dir;
	}
	isStop(dir) {
		return this.newDirection(dir) == null;
	}
	outline(color = "white") {
		ctx.lineWidth = 1;
		ctx.strokeStyle = color;
		this.hex.draw("stroke");
	}
	draw() {
		ctx.fillStyle = this.color;
		this.hex.draw("fill");
		this.outline();
	}
}
class Button extends Tile {
	constructor(grid, hex, loc, color, selectColor, outlineColor, text, onClick) {
		super(grid, hex, loc);
		this.color = color;
		this.selectColor = selectColor;
		this.outlineColor = outlineColor;
		this.text = text;
		this.onClick = onClick;
	}
	draw() {
		ctx.fillStyle = this.hex.contains(mouse) ? this.selectColor : this.color;
		this.hex.draw("fill");
		this.outline(this.outlineColor);
		this.hex.drawText(this.text, BUTTON_FONT, {colors: [this.color == "black" ? "white" : "black", "gold"], centerX: true, centerY: true});
	}
}
class AngledTile extends Tile {
	constructor(grid, hex, loc, angle) {
		super(grid, hex, loc);
		this.angle = angle;
	}
}
class Blank extends Tile {
	draw() {}
}
class Ice extends Tile {
	color = "skyblue";
}
class Wall extends Tile {
	color = "black";
	newDirection(dir) {
		return null;
	}
}
class Sand extends Tile {
	color = "#ff7";
	newDirection(dir) {
		return new Vec(0, 0);
	}
}
class Goal extends Tile {
	color = "gold";
}
class Mirror extends AngledTile {
	color = "black";
	newDirection(dir) {
		dir = dir.invert();
		let index = directionIndex(dir);
		let nextAngle = (this.angle + 1) % 6;
		let lastAngle = (this.angle + 5) % 6;
		if (index == this.angle) return dir;
		if (index == nextAngle) return DIRECTIONS[lastAngle];
		if (index == lastAngle) return DIRECTIONS[nextAngle];
		return null;
	}
	draw() {
		ctx.fillStyle = "skyblue";
		this.hex.draw("fill");
		let points = this.hex.points;
		let angle = this.angle;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(points[angle].x, points[angle].y);
		for (let i = 0; i < 3; i++) {
			angle = (angle + 1) % 6;
			ctx.lineTo(points[angle].x, points[angle].y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(points[this.angle].x, points[this.angle].y);
		ctx.lineTo(points[angle].x, points[angle].y);
		ctx.strokeStyle = "red";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.lineWidth = 1;
		this.outline();
	}
}
class BigMirror extends AngledTile {
	color = "black";
	newDirection(dir) {
		dir = dir.invert();
		let index = directionIndex(dir);
		let nextAngle = (this.angle + 1) % 6;
		if (index == nextAngle) return DIRECTIONS[this.angle];
		if (index == this.angle) return DIRECTIONS[nextAngle];
		return null;
	}
	draw() {
		ctx.fillStyle = "skyblue";
		this.hex.draw("fill");
		let points = this.hex.points;
		let angle = this.angle;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(points[angle].x, points[angle].y);
		for (let i = 0; i < 4; i++) {
			angle = (angle + 1) % 6;
			ctx.lineTo(points[angle].x, points[angle].y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(points[this.angle].x, points[this.angle].y);
		ctx.lineTo(points[angle].x, points[angle].y);
		ctx.strokeStyle = "red";
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.lineWidth = 1;
		this.outline();
	}
}
class Redirector extends AngledTile {
	color = "red";
	newDirection(dir) {
		return DIRECTIONS[this.angle];
	}
	draw() {
		ctx.fillStyle = "skyblue";
		this.hex.draw("fill");
		let points = this.hex.points;
		let angle = (this.angle + 1) % 6;
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.moveTo(points[angle].x, points[angle].y);
		angle = (angle + 1) % 6;
		ctx.lineTo(points[angle].x, points[angle].y);
		ctx.lineTo(this.hex.center.x, this.hex.center.y);
		ctx.closePath();
		ctx.fill();
		this.outline();
	}
}
class Rotator extends AngledTile {
	color = "skyblue";
	newDirection(dir) {
		return DIRECTIONS[(directionIndex(dir) + this.angle) % 6];
	}
	draw() {
		super.draw();
		this.hex.drawImage("rotator.svg", this.angle == 2 ? 1 : -1, 1);
	}
}
class Switch extends Tile {
	color = "violet";
	onEnter() {
		for (const row of this.grid.grid) {
			for (const hex of row) {
				if (hex instanceof ToggledWall) hex.angle = !hex.angle;
			}
		}
		return true;
	}
	draw() {
		ctx.fillStyle = "skyblue";
		this.hex.draw("fill");
		ctx.fillStyle = this.color;
		this.hex.draw("fill", 0.5, 0.5);
		this.outline();
	}
}
class ToggledWall extends AngledTile {
	color = "purple";
	newDirection(dir) {
		return this.angle ? null : dir;
	}
	draw() {
		if (this.angle) {
			super.draw();
		} else {
			ctx.fillStyle = "skyblue";
			this.hex.draw("fill");
			ctx.setLineDash([this.hex.radius, this.hex.radius]);
			ctx.lineDashOffset = lastTime * 0.1;
			ctx.lineWidth = 8;
			ctx.strokeStyle = this.color;
			this.hex.draw("stroke", 0.9, 0.9);
			ctx.lineWidth = 1;
			ctx.setLineDash([]);
			this.outline();
		}
	}
}
const TILES = [, Ice, Wall, Sand, Goal, Mirror, Redirector, Rotator, Switch, ToggledWall];
class Grid {
	constructor(width = 10, height = 10, edgeRadius = EDGE_RADIUS, fill = Ice) {
		this.width = width;
		this.height = height;
		this.edgeRadius = edgeRadius;
		this.grid = [];
		for (let y = 0; y < this.height; y++) {
			this.grid.push([]);
			for (let x = 0; x < this.width; x++) {
				this.setTile(fill, new Vec(x, y));
			}
		}
	}
	static rowOffset(index) {
		return index % 2 ? 0.5 : 0;
	}
	static adjacentIndex(currentIndex, dir) {
		let x = currentIndex.x + (dir.y ? Math.floor(dir.x / 2 + Grid.rowOffset(currentIndex.y)) : dir.x);
		let y = currentIndex.y + dir.y;
		return new Vec(x, y);
	}
	get hovered() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let hex = this.grid[y][x].hex;
				if (hex.contains(mouse)) return new Vec(x, y);
			}
		}
		return null;
	}
	setTile(tile, loc, ...args) {
		let diameter = this.edgeRadius * 2;
		let center = new Vec(
			(loc.x + Grid.rowOffset(loc.y) + 1) * diameter,
			(loc.y + 1) * diameter * Hex.HEIGHT_FACTOR
		);
		let hex = new Hex(center, this.edgeRadius);
		this.grid[loc.y][loc.x] = new tile(this, hex, loc, ...args);
	}
	getTile(loc) {
		return this.grid[loc.y]?.[loc.x];
	}
	draw() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				this.grid[y][x].draw();
			}
		}
	}
	copy() {
		let result = new Grid(this.width, this.height, this.edgeRadius);
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let tile = this.grid[y][x];
				result.setTile(tile.constructor, tile.loc, tile.angle);
			}
		}
		return result;
	}
}
class Menu extends Grid {
	constructor() {
		super(10, 10, EDGE_RADIUS, Blank);
		let i = 0;
		let addButton = loc => {
			if (i > LEVELS.length - 1) {
				this.setTile(Wall, loc);
				i++;
				return;
			}
			let closedI = i;
			let req = getStarRequirement(i);
			let count = starCount();
			if (count < req) {
				let outline = "white";
				if (i % 7 == 6 && count >= getStarRequirement(i - 1)) {
					outline = "black";
				}
				this.setTile(Button, loc, "black", "black", outline, req + "★");
			} else {
				this.setTile(Button, loc, "white", "skyblue", "black", i + 1 + "\n" + starStr(stars[i]), () => {
					inMenu = false;
					loadLevel(closedI, true);
				});
			}
			i++;
		};
		for (const center of [new Vec(2, 3), new Vec(6, 3), new Vec(2, 7), new Vec(6, 7)]) {
			for (const dir of DIRECTIONS.toReversed()) {
				addButton(Grid.adjacentIndex(center, dir));
			}
			addButton(center);
		}
	}
}
class Player {
	constructor(grid, loc) {
		this.grid = grid;
		this.loc = loc;
		this.stops = [];
		this.grids = [grid];
		this.drawLoc = this.tile.hex.center;
		this.radius = this.grid.edgeRadius / 2;
		this.moves = 0;
	}
	get tile() {
		return this.grid.getTile(this.loc);
	}
	get winning() {
		return this.tile instanceof Goal;
	}
	onClick() {
		if (this.stops.length) return;
		for (const [tile, dir] of this.tile.adjacency) {
			if (tile.hex.contains(mouse)) {
				this.move(dir);
				break;
			}
		}
	}
	addStop() {
		this.stops.push(this.tile.hex.center.copy());
		this.grids.push(this.grid.copy());
	}
	move(dir) {
		this.moves++;
		this.grids = [this.grid.copy()];
		this.keepMoving(dir);
		this.adjust();
	}
	keepMoving(dir) {
		if (dir.equals(new Vec(0, 0))) return;
		let nextTile = this.grid.getTile(Grid.adjacentIndex(this.loc, dir));
		if (!nextTile || nextTile.isStop(dir)) {
			this.addStop();
			return;
		}
		this.loc = nextTile.loc;
		let newDir = nextTile.newDirection(dir);
		if (nextTile.onEnter() || !dir.equals(newDir)) this.addStop();
		this.keepMoving(newDir);
	}
	approach() {
		if (!this.stops.length) return;
		let toNextStop = this.stops[0].sub(this.drawLoc);
		let length = toNextStop.length;
		for (let i = 1; i < this.stops.length; i++) {
			length += this.stops[i].dist(this.stops[i - 1]);
		}
		let speed = (0.3 + length * 0.005) * delta;
		if (toNextStop.length > speed + EPSILON) {
			toNextStop = toNextStop.withLength(speed);
		} else {
			this.stops.shift();
			this.grids.shift();
		}
		this.drawLoc = this.drawLoc.add(toNextStop);
	}
	adjust() {
		let stops = [this.drawLoc, ...this.stops];
		let newStops = [];
		for (let i = 2; i < stops.length; i++) {
			let a = stops[i - 2];
			let b = stops[i - 1];
			let c = stops[i];
			let toA = a.sub(b).withLength(1);
			let toC = c.sub(b).withLength(1);
			if (toA.equals(toC.invert())) {
				newStops.push(b);
			} else {
				newStops.push(toA.add(toC).withLength(this.radius).add(b));
			}
		}
		newStops.push(this.stops.at(-1));
		this.stops = newStops;
	}
	draw(real) {
		if (real) {
			this.grid.draw();
		} else {
			this.grids[0].draw();
		}
		this.approach();
		ctx.beginPath();
		ctx.arc(this.drawLoc.x, this.drawLoc.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		if (this.stops.length || this.winning) return;
		ctx.strokeStyle = "blue";
		for (const [tile, dir] of this.tile.adjacency) {
			if (!tile.hex.contains(mouse)) {
				let center = tile.hex.center;
				let v = center.sub(this.drawLoc).withLength(this.grid.edgeRadius * 0.7);
				drawArrow([center.sub(v), center.add(v)], this.grid.edgeRadius * 0.6, 1.25, 1.5);
			}
		}
		ctx.strokeStyle = "red";
		for (const [tile, dir] of this.tile.adjacency) {
			if (tile.hex.contains(mouse)) {
				let scout = this.copy();
				scout.move(dir);
				drawArrow([scout.drawLoc, ...scout.stops], this.grid.edgeRadius / 8, 3, 4.5);
			}
		}
	}
	copy() {
		return new Player(grid.copy(), this.loc);
	}
}
function directionIndex(dir) {
	return DIRECTIONS.findIndex(x => x.equals(dir));
}
function loadLevel(id, logging) {
	if (starCount() < getStarRequirement(id)) {
		enterMenu();
		return;
	}
	if (logging) {
		log({
			action: "Start Level",
			stars: starCount(),
			level: id
		});
	}
	grid = new Grid();
	let str = LEVELS[id];
	player = new Player(grid, new Vec(+str[0], +str[2]));
	let ptr = 4;
	for (let i = 0; i < 100; i++) {
		let tile = TILES[str[ptr]];
		let angle;
		if (tile.prototype instanceof AngledTile) angle = +str[++ptr];
		ptr += 2;
		grid.setTile(tile, new Vec(i % 10, Math.floor(i / 10)), angle);
	}
	target = +str.substring(ptr);
	level = id;
}
function starCount() {
	return stars.reduce((sum, a) => sum + a, 0);
}
function starStr(count) {
	return "★".repeat(count) + "☆".repeat(3 - count);
}
function getStarRequirement(id) {
	if (id && id < 6) {
		return 1;
	} else if (id % 7 == 6) {
		return Math.ceil(id / 7) * 15;
	} else {
		return Math.floor(id / 7) * 10;
	}
}
function scaleCanvas() {
	canvas.width = innerWidth * devicePixelRatio;
	canvas.height = innerHeight * devicePixelRatio;
	ctx.scale(devicePixelRatio, devicePixelRatio);
}
function drawImage(src, x, y, width, height) {
	if (!images.has(src)) {
		let img = new Image();
		img.src = src;
		images.set(src, img);
	}
	ctx.drawImage(images.get(src), x, y, width, height);
}
function drawText(str, x, y, font, {
	color = "black",
	colors = [],
	spacing = 1,
	centerX = false,
	centerY = false
} = {}) {
	let lines = str.split("\n");
	ctx.textAlign = centerX ? "center" : "left";
	let fontSize = parseInt(font);
	ctx.font = font;
	let metrics = ctx.measureText("M");
	y += metrics.actualBoundingBoxAscent;
	if (centerY) {
		y -= (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + (lines.length - 1) * fontSize) / 2;
	}
	for (let i = 0; i < lines.length; i++) {
		ctx.fillStyle = colors[i] ?? color;
		ctx.fillText(lines[i], x, y + i * fontSize * spacing);
	}
}
function enterMenu() {
	inMenu = true;
	menu = new Menu();
}
function drawArrow(points, lineWidth, widthFactor, lengthFactor) {
	let a = points.at(-2);
	let b = points.at(-1);
	let toB = b.sub(a).withLength(1);
	let width = lineWidth * widthFactor;
	let length = lineWidth * lengthFactor;
	let normal = toB.normal.scale(width);
	let base = b.sub(toB.scale(length));
	let left = base.add(normal);
	let right = base.sub(normal);
	let front = b.sub(toB.scale(length * 0.9));
	ctx.lineWidth = lineWidth;
	ctx.beginPath();
	ctx.moveTo(front.x, front.y);
	for (const point of points.toReversed().slice(1)) {
		ctx.lineTo(point.x, point.y);
	}
	ctx.stroke();
	ctx.fillStyle = ctx.strokeStyle;
	ctx.beginPath();
	ctx.moveTo(b.x, b.y);
	ctx.lineTo(left.x, left.y);
	ctx.lineTo(right.x, right.y);
	ctx.fill();
}
function updateDelta() {
	let time = performance.now();
	delta = time - lastTime;
	lastTime = time;
}
function updateMouse(e) {
	mouse.x = e.x;
	mouse.y = e.y;
}
const EPSILON = 0.0000001;
const EDGE_RADIUS = Math.min(innerWidth / 40, innerHeight / 20);
const UI_FONT = EDGE_RADIUS * 0.8 + "px monospace";
const BUTTON_FONT = EDGE_RADIUS * 0.6 + "px monospace";
let mouse = new Vec(0, 0);
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let images = new Map();
let textY = 0;
let lastTime = performance.now();
let delta;
let grid = new Grid();
let player;
let level;
let inMenu;
let menu;
let stars = new Array(LEVELS.length).fill(0);
let target = 1;
scaleCanvas();
addEventListener("resize", scaleCanvas);
