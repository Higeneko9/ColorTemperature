/**
 * @description Defines a vector with two components.
 */
class Vector2 {

    /**
     * @description Initialize a new instance of Vector2.
     */
	constructor(public x: number, public y: number){}

    /**
     * @description Returns a Vector2 with all of its components set to zero.
     */
	static zero(): Vector2 { return Vector2._zero;}

    /**
     * @description Transform the vector (x, y, 0, 1) by the specified matrix.
     *
     * @param    position {Vector2} The source vector.
     * @param    matrix {Matrix} The transformation matrix.
     * @return   {Vector2} The transformed vector.
     */
    static transform(position : Vector2, matrix : Matrix) : Vector2
    {
    	return new Vector2(
	        position.x * matrix.m11 + position.y * matrix.m21 + matrix.m41,
	        position.x * matrix.m12 + position.y * matrix.m22 + matrix.m42
		);
    }

    /**
     * @description Transform a 2D vector normal of vector normals by matrix.
     *
     * @param    normal {Vector2} The source vector.
     * @param    matrix {Matrix} The transformation matrix.
     * @return   {Vector2} The transformed normal.
     */
	static transformNormal(normal : Vector2, matrix : Matrix) : Vector2
    {
    	return new Vector2(
	        normal.x * matrix.m11 + normal.y * matrix.m21,
	        normal.x * matrix.m12 + normal.y * matrix.m22
		);
    }

    /**
     * @description Performs a linear interpolation between two vectors.
     *
     * @param    value1 {Vector2} Source vector.
     * @param    value2 {Vector2} Source vector.
     * @param    amount {Number} Value between 0 and 1 indicating the wight of value2.
     * @return   {Vector2} The linear interpolation of the two vectors.
     */
    static lerp(value1: Vector2, value2: Vector2, amount: number) : Vector2 {
    	return new Vector2(
            value1.x + (value2.x - value1.x) * amount,
            value1.y + (value2.y - value1.y) * amount);
    }

    /**
     * @description Add two vectors.
     *
     * @param    value1 {Vector2} Source vector.
     * @param    value2 {Vector2} Source vector.
     * @return   {Vector2} Sum of the source vectors.
     */
    static add(value1: Vector2, value2: Vector2) : Vector2 {
    	return new Vector2(value1.x + value2.x, value1.y + value2.y);
    }

    private static _zero : Vector2 = new Vector2(0, 0);
}


