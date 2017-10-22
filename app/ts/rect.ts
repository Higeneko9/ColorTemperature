/**
 * Class represents a point.
 */
class Point {
    constructor(public x: number, public y: number){}
}

/**
 * Class represents a rectangle.
 */
class Rect {
    constructor(
        public left: number,
        public top: number,
        public right: number,
        public bottom: number){}

    width() : number { return this.right - this.left; }
    height() : number { return this.bottom - this.top; }

    containsPoint(point: Point) : boolean {
        return this.left <= point.x && point.x < this.right &&
                this.top <= point.y && point.y < this.bottom;
    }
}