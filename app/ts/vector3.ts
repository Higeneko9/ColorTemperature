/**
 * @description Defines a vector with three components.
 */
class Vector3 {

    /**
     * @description Initialize a new instance of Vector3.
     */
    constructor(public x: number, public y: number, public z:number){}

    /**
     * @description Returns a Vector3 with all of its components set to zero.
     */
    static zero(): Vector3 { return Vector3._zero;}

    /**
     * @description Transform the vector (x, y, z, 1) by the specified matrix.
     *
     * @param    position {Vector3} The source vector.
     * @param    matrix {Matrix} The transformation matrix.
     * @return   {Vector3} The transformed vector.
     */
    static Transform(position : Vector3, matrix : Matrix) : Vector3
    {
        return new Vector3(
            position.x * matrix.m11 + position.y * matrix.m21 + position.z * matrix.m31 + matrix.m41,
            position.x * matrix.m12 + position.y * matrix.m22 + position.z * matrix.m32 + matrix.m42,
            position.x * matrix.m13 + position.y * matrix.m23 + position.z * matrix.m33 + matrix.m43
        );
    }

    /**
     * @description Transform a 3D vector normal of vector normals by matrix.
     *
     * @param    normal {Vector2} The source vector.
     * @param    matrix {Matrix} The transformation matrix.
     * @return   {Vector2} The transformed normal.
     */
    static TransformNormal(normal : Vector3, matrix : Matrix) : Vector3
    {
        return new Vector3(
            normal.x * matrix.m11 + normal.y * matrix.m21 + normal.z * matrix.m31,
            normal.x * matrix.m12 + normal.y * matrix.m22 + normal.z * matrix.m32,
            normal.x * matrix.m13 + normal.y * matrix.m23 + normal.z * matrix.m33
        );
    }
 
    private static _zero : Vector3 = new Vector3(0, 0, 0);
}


