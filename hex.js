class Point {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	equals(other) {
		return this.x == other.x && this.y == other.y;
	}
	invert() {
		return new Point(-this.x, -this.y);
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
			points.push(new Point(
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
class Tile {
	constructor(grid, hex, loc) {
		this.grid = grid;
		this.hex = hex;
		this.loc = loc;
	}
	get adjacency() {
		let pairs = [];
		for (const [x, y] of [[-1, -1], [-1, 0], [-1, 1], [1, -1], [1, 0], [1, 1]]) {
			let dir = new Point(x, y);
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
		return new Point(0, 0);
	}
}
class Goal extends Tile {
	color = "gold";
	win = true;
}
class Mirror extends Tile {
	static DIRECTIONS = [new Point(1, -1), new Point(1, 0), new Point(1, 1), new Point(-1, 1), new Point(-1, 0), new Point(-1, -1)];
	color = "black";
	constructor(grid, hex, loc, angle) {
		super(grid, hex, loc);
		this.angle = angle;
	}
	newDirection(dir) {
		dir = dir.invert();
		let index = Mirror.DIRECTIONS.findIndex(x => x.equals(dir));
		let nextAngle = (this.angle + 1) % 6;
		let lastAngle = (this.angle + 5) % 6;
		if (index == this.angle) return dir;
		if (index == nextAngle) return Mirror.DIRECTIONS[lastAngle];
		if (index == lastAngle) return Mirror.DIRECTIONS[nextAngle];
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
const TILES = [, Ice, Wall, Sand, Goal, Mirror];
class Grid {
	constructor(width, height, edgeRadius) {
		this.width = width;
		this.height = height;
		this.edgeRadius = edgeRadius;
		this.grid = [];
		for (let y = 0; y < this.height; y++) {
			this.grid.push([]);
			for (let x = 0; x < this.width; x++) {
				this.setTile(Ice, new Point(x, y));
			}
		}
	}
	static rowOffset(index) {
		return index % 2 ? 0.5 : 0;
	}
	static adjacentIndex(currentIndex, dir) {
		let x = currentIndex.x + (dir.y ? Math.floor(dir.x / 2 + Grid.rowOffset(currentIndex.y)) : dir.x);
		let y = currentIndex.y + dir.y;
		return new Point(x, y);
	}
	get hovered() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				let hex = this.grid[y][x].hex;
				if (hex.contains(mouse)) return new Point(x, y);
			}
		}
		return null;
	}
	setTile(tile, loc, ...args) {
		let diameter = this.edgeRadius * 2;
		let center = new Point(
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
		this.loc = new Point(x, y);
		this.moving = false;
		this.drawLoc = this.tile.hex.center;
	}
	get tile() {
		return this.grid.getTile(this.loc);
	}
	onClick() {
		if (this.moving) return;
		for (const [tile, dir] of this.tile.adjacency) {
			if (tile.hex.contains(mouse)) {
				this.move(dir);
				this.moving = true;
				break;
			}
		}
	}
	move(dir, moved) {
		if (dir.equals(new Point(0, 0))) return;
		let nextTile = this.grid.getTile(Grid.adjacentIndex(this.loc, dir));
		if (!nextTile || nextTile.isStop(dir)) return;
		if (!moved) moves++;
		this.loc = nextTile.loc;
		this.move(nextTile.newDirection(dir), true);
	}
	approach() {
		let dx = this.tile.hex.center.x - this.drawLoc.x;
		let dy = this.tile.hex.center.y - this.drawLoc.y;
		let hypot = Math.hypot(dx, dy);
		let speed = 3 + hypot * 0.05;
		if (hypot > speed + 0.0000001) {
			let factor = speed / hypot;
			dx *= factor;
			dy *= factor;
		} else {
			this.moving = false;
		}
		this.drawLoc = new Point(this.drawLoc.x + dx, this.drawLoc.y + dy);
	}
	draw() {
		this.approach();
		ctx.beginPath();
		ctx.arc(this.drawLoc.x, this.drawLoc.y, this.grid.edgeRadius / 2, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		if (this.moving) return;
		for (const [tile, dir] of this.tile.adjacency) {
			let center = tile.hex.center;
			ctx.fillStyle = tile.hex.contains(mouse) ? "green" : "blue";
			ctx.beginPath();
			ctx.arc(center.x, center.y, this.grid.edgeRadius / 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}
}
function scaleCanvas() {
	canvas.width = innerWidth * devicePixelRatio;
	canvas.height = innerHeight * devicePixelRatio;
	ctx.scale(devicePixelRatio, devicePixelRatio);
	ctx.textBaseline = "top";
}
function updateMouse(e) {
	mouse.x = e.x;
	mouse.y = e.y;
}
let mouse = new Point(0, 0);
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
scaleCanvas();
addEventListener("resize", scaleCanvas);