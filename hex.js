class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(other) {
        return this.x == other.x && this.y == other.y;
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
            if (tile && !tile.stop) {
                pairs.push([tile, dir]);
            }
        }
        return pairs;
    }
}
class Ice extends Tile {
    color = "skyblue";
    shift = true;
}
class Wall extends Tile {
    color = "black";
    stop = true;
}
class Sand extends Tile {
    color = "#ff7";
}
class Flag extends Tile {
    color = "gold";
    shift = true;
    win = true;
}
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
        return new Point(-1, -1);
    }
    setTile(tile, loc) {
        let diameter = this.edgeRadius * 2;
        let center = new Point(
            (loc.x + Grid.rowOffset(loc.y) + 1) * diameter,
            (loc.y + 1) * diameter * Hex.HEIGHT_FACTOR
        );
        let hex = new Hex(center, this.edgeRadius);
        this.grid[loc.y][loc.x] = new tile(this, hex, loc);
    }
    getTile(loc) {
        return this.grid[loc.y]?.[loc.x];
    }
    draw() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                let tile = this.grid[y][x];
                let hex = tile.hex;
                ctx.fillStyle = tile.color;
                hex.draw("fill");
                ctx.strokeStyle = "white";
                hex.draw("stroke");
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
        let nextTile = this.grid.getTile(Grid.adjacentIndex(this.loc, dir));
        if (!nextTile || nextTile.stop) return;
        if (!moved) moves++;
        this.loc = nextTile.loc;
        if (nextTile.shift) this.move(dir, true);
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
        } else this.moving = false;
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
function loadLevel(level) {
    moves = 0;
    grid = new Grid(10, 10, innerHeight / 20);
    if (level == 0) {
        player = new Player(grid, 0, 9);
        grid.setTile(Wall, new Point(3, 4));
        grid.setTile(Flag, new Point(4, 9));
    } else if (level == 1) {
        player = new Player(grid, 0, 9);
        grid.setTile(Wall, new Point(3, 3));
        grid.setTile(Wall, new Point(8, 3));
        grid.setTile(Flag, new Point(8, 4));
    } else if (level == 2) {
        player = new Player(grid, 0, 9);
        grid.setTile(Wall, new Point(3, 4));
        grid.setTile(Wall, new Point(7, 3));
        grid.setTile(Wall, new Point(8, 0));
        grid.setTile(Flag, new Point(9, 1));
    } else if (level == 3) {
        player = new Player(grid, 0, 9);
        grid.setTile(Flag, new Point(1, 9));
    } else if (level == 4) {
        player = new Player(grid, 0, 9);
        grid.setTile(Wall, new Point(1, 0));
        grid.setTile(Wall, new Point(1, 1));
        grid.setTile(Wall, new Point(2, 3));
        grid.setTile(Wall, new Point(4, 2));
        grid.setTile(Wall, new Point(0, 3));
        grid.setTile(Wall, new Point(4, 3));
        grid.setTile(Wall, new Point(4, 9));
        grid.setTile(Wall, new Point(0, 7));
        grid.setTile(Flag, new Point(0, 0));
    }
}
function scaleCanvas() {
    canvas.width = innerWidth * devicePixelRatio;
    canvas.height = innerHeight * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.textBaseline = "top";
}
function draw() {
    requestAnimationFrame(draw);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    grid.draw();
    player.draw();
    ctx.fillStyle = "black";
    ctx.font = "40px monospace";
    ctx.fillText("Moves: " + moves, 1080, 70);
}
let mouse = new Point(0, 0);
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");
scaleCanvas();
canvas.addEventListener("pointermove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});
canvas.addEventListener("pointerdown", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    player.onClick();
});
addEventListener("resize", scaleCanvas);
addEventListener("keydown", e => {
    if (e.key == "r") loadLevel(level)
    else if (e.key == "Enter" && player.tile.win) loadLevel(++level);
});
let level = 0;
let moves = 0;
let grid;
let player;
loadLevel(0);
draw();
