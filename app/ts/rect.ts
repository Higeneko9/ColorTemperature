/**
 * Class represents a point.
 */
class Point {
    constructor(public x: number, public y: number){}

    /**
     * @description Add two points.
     *
     * @param    value1 {Point} Source point.
     * @param    value2 {Point} Source point.
     * @return   {Point} Sum of the source points.
    */
    static add(value1: Point, value2: Point) : Point {
        return new Point(value1.x + value2.x, value1.y + value2.y);
    }

    /**
     * @description Subtracs the specified point from another specified point.
     *
     * @param    value1 {Point} The point from which value2 is subtracted.
     * @param    value2 {Point} The point to subtract from value1.
     * @return   {Point} The difference between value1 and value2.
    */
   static subtract(value1: Point, value2: Point) : Point {
        return new Point(value1.x - value2.x, value1.y - value2.y);
   }
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

    static fromElementBounds(element : HTMLElement) : Rect {
        var rc = element.getBoundingClientRect();
        return new Rect(rc.left, rc.top, rc.right, rc.bottom);
    }

    pos() : Point { return new Point(this.left,this.top);} 
    width() : number { return this.right - this.left; }
    height() : number { return this.bottom - this.top; }

    containsPoint(point: Point) : boolean {
        return this.left <= point.x && point.x < this.right &&
                this.top <= point.y && point.y < this.bottom;
    }
}