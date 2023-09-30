export class Path {
    x: number;
    y: number;
    g: number; // Cost from start to current node
    h: number; // Heuristic (estimated cost to target)
    parent: Path | null;

    constructor(x: number, y: number, g = 0, h = 0) {
        this.x = x;
        this.y = y;
        this.g = g;
        this.h = h;
        this.parent = null;
    }

    get f(): number {
        return this.g + this.h;
    }
}


