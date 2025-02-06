class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
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
		return Math.abs(this.x - other.x) < EPSILON && Math.abs(this.y == other.y) < EPSILON;
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
	drawText(str) {
		ctx.textAlign = "center";
		ctx.font = Math.floor(this.edgeRadius * 0.6) + "px monospace";
		ctx.fillText(str, this.center.x, this.center.y - ctx.measureText(str).actualBoundingBoxDescent / 2);
		ctx.textAlign = "left";
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
		ctx.strokeStyle = color;
		this.hex.draw("stroke");
	}
	draw() {
		ctx.fillStyle = this.color;
		this.hex.draw("fill");
		this.outline();
	}
}
class AngledTile extends Tile {
	constructor(grid, hex, loc, angle) {
		super(grid, hex, loc);
		this.angle = angle;
	}
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
	win = true;
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
	color = "yellow";
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
	constructor(width = 10, height = 10, edgeRadius = EDGE_RADIUS) {
		this.width = width;
		this.height = height;
		this.edgeRadius = edgeRadius;
		this.grid = [];
		for (let y = 0; y < this.height; y++) {
			this.grid.push([]);
			for (let x = 0; x < this.width; x++) {
				this.setTile(Ice, new Vec(x, y));
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
	setTile(tile, loc, angle) {
		let diameter = this.edgeRadius * 2;
		let center = new Vec(
			(loc.x + Grid.rowOffset(loc.y) + 1) * diameter,
			(loc.y + 1) * diameter * Hex.HEIGHT_FACTOR
		);
		let hex = new Hex(center, this.edgeRadius);
		this.grid[loc.y][loc.x] = new tile(this, hex, loc, angle);
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
class Player {
	constructor(grid, x, y) {
		this.grid = grid;
		this.loc = new Vec(x, y);
		this.stops = [];
		this.grids = [grid];
		this.drawLoc = this.tile.hex.center;
		this.radius = this.grid.edgeRadius / 2;
	}
	get tile() {
		return this.grid.getTile(this.loc);
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
		moves++;
		this.grids = [this.grid.copy()];
		this.keepMoving(dir);
		this.adjust();
	}
	keepMoving(dir) {
		if (dir.equals(new Vec(0, 0))) return;
		let nextTile = this.grid.getTile(Grid.adjacentIndex(this.loc, dir));
		if (!nextTile || nextTile.isStop(dir)) {
			// this.tile.color = "lime";
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
			if (toA.equals(toB)) {
				newStops.push(b);
			} else {
				newStops.push(toA.add(toC).withLength(this.radius).add(b));
			}
		}
		newStops.push(this.stops.at(-1));
		this.stops = newStops;
	}
	draw() {
		// ctx.beginPath();
		// ctx.moveTo(this.drawLoc.x, this.drawLoc.y);
		// for (let x of this.stops) {
		// 	ctx.lineTo(x.x, x.y);
		// }
		// ctx.stroke();
		this.grids[0].draw();
		this.approach();
		ctx.beginPath();
		ctx.arc(this.drawLoc.x, this.drawLoc.y, this.radius, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		if (this.stops.length) return;
		for (const [tile, dir] of this.tile.adjacency) {
			let center = tile.hex.center;
			ctx.fillStyle = tile.hex.contains(mouse) ? "green" : "blue";
			ctx.beginPath();
			ctx.arc(center.x, center.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}
function directionIndex(dir) {
	return DIRECTIONS.findIndex(x => x.equals(dir));
}
function loadLevel(id) {
	moves = 0;
	grid = new Grid();
	let str = LEVELS[id];
	player = new Player(grid, +str[0], +str[2]);
	let ptr = 4;
	for (let i = 0; i < 100; i++) {
		let tile = TILES[str[ptr]];
		let angle;
		if (tile.prototype instanceof AngledTile) angle = +str[++ptr];
		ptr += 2;
		grid.setTile(tile, new Vec(i % 10, Math.floor(i / 10)), angle);
	}
	target = +str.substring(ptr);
}
function scaleCanvas() {
	canvas.width = innerWidth * devicePixelRatio;
	canvas.height = innerHeight * devicePixelRatio;
	ctx.scale(devicePixelRatio, devicePixelRatio);
	ctx.textBaseline = "top";
}
function drawImage(src, x, y, width, height) {
	if (!images.has(src)) {
		let img = new Image();
		img.src = src;
		images.set(src, img);
	}
	ctx.drawImage(images.get(src), x, y, width, height);
}
function resetText() {
	textY = 0;
	ctx.fillStyle = "black";
	ctx.font = Math.floor(EDGE_RADIUS * 0.8) + "px monospace";
}
function drawText(str) {
	textY += EDGE_RADIUS;
	ctx.fillText(str, EDGE_RADIUS * 23, textY);
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
let mouse = new Vec(0, 0);
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let images = new Map();
let textY = 0;
let lastTime = performance.now();
let delta;
let grid = new Grid();
let player;
let target = 1;
scaleCanvas();
addEventListener("resize", scaleCanvas);