type ColorGirdIterator = {x: number, y: number, isCenterX: boolean, isCenterY: boolean};
type ColorGridDrawContext = {x: number, y: number};

/**
 * @description The class represents square color grid
 */
class ColorGrid {

	// Color grid position.
	pos: {x: number, y: number};

	numCells() : number { return this._numCells; }
	numWingCells() : number { return this._numWingCells; }
	gridSize() : number { return this._gridSize; }

	private _numWingCells: number;
	private _numCells: number;
	private _totalCellCount: number
	private _cells: RgbColor[];

	private _rawGridSize: number;
	private _gridSize: number;
	private _cellSize: number;

	constructor(initialWingCells: number){
		this.pos = {x:0, y:0};
		this.setWingCellCount(initialWingCells);
	}

	// Set wing cell count (total cell count = 1 + wing cell count * 2)
	setWingCellCount(newNumWingCells: number){
		this._numWingCells = newNumWingCells;
		this._numCells = this._numWingCells * 2 + 1;
		this._totalCellCount = this._numCells * this._numCells;
		this._cells = new Array(this._totalCellCount);

		this.adjustCellSize();
	}

	// Resize the color grid.
	resize(newGridSize: number) : number {
		this._rawGridSize = newGridSize;
		return this.adjustCellSize();
	}

	// Update cell colors.
	updateColors(callback: (it: ColorGirdIterator) => RgbColor) {

		var it : ColorGirdIterator = {
			x:0, y:0, isCenterX: false, isCenterY: false};

		var cellIdx : number = 0;
		for (it.y = -this._numWingCells; it.y <= this._numWingCells; ++it.y){

			it.isCenterY = it.y == 0;

			for(it.x = -this._numWingCells; it.x <= this._numWingCells; ++it.x){

				it.isCenterX = it.x == 0;
				this._cells[cellIdx++] = callback(it);
			}
		}
	}

	draw(ctx){

		// Draw Color grid
        var cellIdx = 0;
        var y = this.pos.y;
        for (var i = 0; i < this._numCells; ++i, y += this._cellSize) {
            var x = this.pos.x;
            for (var j = 0; j < this._numCells; ++j, x += this._cellSize) {
				ctx.fillStyle = this._cells[cellIdx++].toHexString();
				ctx.fillRect(x, y, this._cellSize, this._cellSize);
            }
        }

        // Draw center grid border.
        // TODO: implement it.
	}

	/**
	 * @description Get a cell color from given x and y coordinate.
	 *
	 * @param      x {number} The x value of coordinate in pixel.
	 * @param      y {number} The y value of coordinate in pixel.
	 *
	 * @return     If given coordinate is valid, it returns the color; otherwise, null.
	 */
	getColor(x: number, y: number): RgbColor {
        var ix = Math.floor(x / this._cellSize);
        var iy = Math.floor(y / this._cellSize);

        return (0 <= ix && ix < this._numCells && 0 <= iy && iy < this._numCells)?
			this._cells[iy * this._numCells + ix] : null;
	}

	private adjustCellSize() : number {
		this._cellSize = Math.floor(this._rawGridSize / this._numCells);
		this._gridSize = this._cellSize * this._numCells;
		return this._gridSize;
	}
}

