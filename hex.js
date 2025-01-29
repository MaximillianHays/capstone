class Vec {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	get length() {
		return Math.hypot(this.x, this.y);
	}
	withLength(length) {
		return this.scale(length / this.length);
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
		return this.x == other.x && this.y == other.y;
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
	draw(fill) {
		let points = this.points;
		ctx.beginPath();
		ctx.moveTo(points[0].x, points[0].y);
		for (let i = 1; i < 6; i++) {
			ctx.lineTo(points[i].x, points[i].y);
		}
		ctx.closePath();
		ctx[fill]();
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
	newDirection(dir) {
		return dir;
	}
	isStop(dir) {
		return this.newDirection(dir) == null;
	}
	draw() {
		ctx.fillStyle = this.color;
		this.hex.draw("fill");
		ctx.strokeStyle = "white";
		this.hex.draw("stroke");
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
		let index = DIRECTIONS.findIndex(x => x.equals(dir));
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
		ctx.strokeStyle = "white";
		this.hex.draw("stroke");
	}
}
class BigMirror extends AngledTile {
	color = "black";
	newDirection(dir) {
		dir = dir.invert();
		let index = DIRECTIONS.findIndex(x => x.equals(dir));
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
		ctx.strokeStyle = "white";
		this.hex.draw("stroke");
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
		ctx.strokeStyle = "white";
		this.hex.draw("stroke");
	}
}
class Rotator extends AngledTile {
	newDirection(dir) {
		return DIRECTIONS[(dir + this.angle) % 6];
	}
}
const TILES = [, Ice, Wall, Sand, Goal, Mirror, Redirector, Rotator];
class Grid {
	constructor(width, height, edgeRadius) {
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
}
class Player {
	constructor(grid, x, y) {
		this.grid = grid;
		this.loc = new Vec(x, y);
		this.stops = [];
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
				this.adjust();
				break;
			}
		}
	}
	addStop() {
		this.stops.push(this.tile.hex.center.copy());
	}
	move(dir, moved) {
		if (dir.equals(new Vec(0, 0))) return;
		let nextTile = this.grid.getTile(Grid.adjacentIndex(this.loc, dir));
		if (!nextTile || nextTile.isStop(dir)) {
			// this.tile.color = "lime";
			this.addStop();
			return;
		}
		if (!moved) moves++;
		this.loc = nextTile.loc;
		let newDir = nextTile.newDirection(dir);
		if (!dir.equals(newDir)) this.addStop();
		this.move(newDir, true);
	}
	approach() {
		if (!this.stops.length) return;
		let toNextStop = this.stops[0].sub(this.drawLoc);
		let length = toNextStop.length;
		for (let i = 1; i < this.stops.length; i++) {
			length += this.stops[i].dist(this.stops[i - 1]);
		}
		let speed = (0.3 + length * 0.005) * delta;
		if (toNextStop.length > speed + 0.0000001) {
			toNextStop = toNextStop.withLength(speed);
		} else {
			this.stops.shift();
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
			newStops.push(toA.add(toC).withLength(this.radius).add(b));
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
function loadLevel(id) {
	moves = 0;
	grid = new Grid(10, 10, innerHeight / 20);
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
function resetText() {
	textY = 0;
	ctx.fillStyle = "black";
	ctx.font = "40px monospace";
}
function drawText(str) {
	textY += 50;
	ctx.fillText(str, 1080, textY);
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
let mouse = new Vec(0, 0);
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
let textY = 0;
let lastTime = performance.now();
let delta;
let grid = new Grid(10, 10, innerHeight / 20);
let player;
let target = 1;
scaleCanvas();
addEventListener("resize", scaleCanvas);