/**
 * @description Defines a 4x4 Matrix
 */
class Matrix {

    constructor(
        public m11:number, public m12:number, public m13: number, public m14: number,
        public m21:number, public m22:number, public m23: number, public m24: number,
        public m31:number, public m32:number, public m33: number, public m34: number,
        public m41:number, public m42:number, public m43: number, public m44: number)
    {
    }

    /**
     * @description Gets the instance of the indentity matrix.
     */
    static identity() : Matrix { return Matrix._identity; }

    /**
     * @description Create a matrix that can be used to rotate a set of vertices around the z-axis.
     *
     * @param radians {number} The amount, in radians, in which to rotate around the z-axis. Note that you can use ToRadians to convert degrees to radians.
     * @return {Matrix} the rotation matrix. 
     */
    static createRotationZ(radians: number) : Matrix
    {
        var c = Math.cos(radians);
        var s = Math.sin(radians);

        // [  c  s  0  0 ]
        // [ -s  c  0  0 ]
        // [  0  0  1  0 ]
        // [  0  0  0  1 ]
        return new Matrix( 
               c,   s, 0.0, 0.0,
              -s,   c, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0);
    }

    /**
     * @description Calculates the determinant of the matrix.
     *
     * @return {Matrix} Calculates the determinant of the matrix.
     */
    getDeterminant() : number
    {
        // | a b c d |     | f g h |     | e g h |     | e f h |     | e f g |
        // | e f g h | = a | j k l | - b | i k l | + c | i j l | - d | i j k |
        // | i j k l |     | n o p |     | m o p |     | m n p |     | m n o |
        // | m n o p |
        //
        //   | f g h |
        // a | j k l | = a ( f ( kp - lo ) - g ( jp - ln ) + h ( jo - kn ) )
        //   | n o p |
        //
        //   | e g h |     
        // b | i k l | = b ( e ( kp - lo ) - g ( ip - lm ) + h ( io - km ) )
        //   | m o p |     
        //
        //   | e f h |
        // c | i j l | = c ( e ( jp - ln ) - f ( ip - lm ) + h ( in - jm ) )
        //   | m n p |
        //
        //   | e f g |
        // d | i j k | = d ( e ( jo - kn ) - f ( io - km ) + g ( in - jm ) )
        //   | m n o |
        //
        // Cost of operation
        // 17 adds and 28 muls.
        //
        // add: 6 + 8 + 3 = 17
        // mul: 12 + 16 = 28

        var a = this.m11, b = this.m12, c = this.m13, d = this.m14;
        var e = this.m21, f = this.m22, g = this.m23, h = this.m24;
        var i = this.m31, j = this.m32, k = this.m33, l = this.m34;
        var m = this.m41, n = this.m42, o = this.m43, p = this.m44;

        var kp_lo = k * p - l * o;
        var jp_ln = j * p - l * n;
        var jo_kn = j * o - k * n;
        var ip_lm = i * p - l * m;
        var io_km = i * o - k * m;
        var in_jm = i * n - j * m;

        return a * (f * kp_lo - g * jp_ln + h * jo_kn) -
               b * (e * kp_lo - g * ip_lm + h * io_km) +
               c * (e * jp_ln - f * ip_lm + h * in_jm) -
               d * (e * jo_kn - f * io_km + g * in_jm);
    }


    /**
     * @description Calculates the inverse of a matrix.
     *
     * @param matrix {Matrix} Source matrix.
     * @return {Matrix} Inverse of the matrix.
     */
    public static Invert(matrix : Matrix) : Matrix
    {
        //                                       -1
        // If you have matrix M, inverse Matrix M   can compute
        //
        //     -1       1      
        //    M   = --------- A
        //            det(M)
        //
        // A is adjugate (adjoint) of M, where,
        //
        //      T
        // A = C
        //
        // C is Cofactor matrix of M, where,
        //           i + j
        // C   = (-1)      * det(M  )
        //  ij                    ij
        //
        //     [ a b c d ]
        // M = [ e f g h ]
        //     [ i j k l ]
        //     [ m n o p ]
        //
        // First Row
        //           2 | f g h |
        // C   = (-1)  | j k l | = + ( f ( kp - lo ) - g ( jp - ln ) + h ( jo - kn ) )
        //  11         | n o p |
        //
        //           3 | e g h |
        // C   = (-1)  | i k l | = - ( e ( kp - lo ) - g ( ip - lm ) + h ( io - km ) )
        //  12         | m o p |
        //
        //           4 | e f h |
        // C   = (-1)  | i j l | = + ( e ( jp - ln ) - f ( ip - lm ) + h ( in - jm ) )
        //  13         | m n p |
        //
        //           5 | e f g |
        // C   = (-1)  | i j k | = - ( e ( jo - kn ) - f ( io - km ) + g ( in - jm ) )
        //  14         | m n o |
        //
        // Second Row
        //           3 | b c d |
        // C   = (-1)  | j k l | = - ( b ( kp - lo ) - c ( jp - ln ) + d ( jo - kn ) )
        //  21         | n o p |
        //
        //           4 | a c d |
        // C   = (-1)  | i k l | = + ( a ( kp - lo ) - c ( ip - lm ) + d ( io - km ) )
        //  22         | m o p |
        //
        //           5 | a b d |
        // C   = (-1)  | i j l | = - ( a ( jp - ln ) - b ( ip - lm ) + d ( in - jm ) )
        //  23         | m n p |
        //
        //           6 | a b c |
        // C   = (-1)  | i j k | = + ( a ( jo - kn ) - b ( io - km ) + c ( in - jm ) )
        //  24         | m n o |
        //
        // Third Row
        //           4 | b c d |
        // C   = (-1)  | f g h | = + ( b ( gp - ho ) - c ( fp - hn ) + d ( fo - gn ) )
        //  31         | n o p |
        //
        //           5 | a c d |
        // C   = (-1)  | e g h | = - ( a ( gp - ho ) - c ( ep - hm ) + d ( eo - gm ) )
        //  32         | m o p |
        //
        //           6 | a b d |
        // C   = (-1)  | e f h | = + ( a ( fp - hn ) - b ( ep - hm ) + d ( en - fm ) )
        //  33         | m n p |
        //
        //           7 | a b c |
        // C   = (-1)  | e f g | = - ( a ( fo - gn ) - b ( eo - gm ) + c ( en - fm ) )
        //  34         | m n o |
        //
        // Fourth Row
        //           5 | b c d |
        // C   = (-1)  | f g h | = - ( b ( gl - hk ) - c ( fl - hj ) + d ( fk - gj ) )
        //  41         | j k l |
        //
        //           6 | a c d |
        // C   = (-1)  | e g h | = + ( a ( gl - hk ) - c ( el - hi ) + d ( ek - gi ) )
        //  42         | i k l |
        //
        //           7 | a b d |
        // C   = (-1)  | e f h | = - ( a ( fl - hj ) - b ( el - hi ) + d ( ej - fi ) )
        //  43         | i j l |
        //
        //           8 | a b c |
        // C   = (-1)  | e f g | = + ( a ( fk - gj ) - b ( ek - gi ) + c ( ej - fi ) )
        //  44         | i j k |
        //
        // Cost of operation
        // 53 adds, 104 muls, and 1 div.
        var a = matrix.m11, b = matrix.m12, c = matrix.m13, d = matrix.m14;
        var e = matrix.m21, f = matrix.m22, g = matrix.m23, h = matrix.m24;
        var i = matrix.m31, j = matrix.m32, k = matrix.m33, l = matrix.m34;
        var m = matrix.m41, n = matrix.m42, o = matrix.m43, p = matrix.m44;

        var kp_lo = k * p - l * o;
        var jp_ln = j * p - l * n;
        var jo_kn = j * o - k * n;
        var ip_lm = i * p - l * m;
        var io_km = i * o - k * m;
        var in_jm = i * n - j * m;

        var a11 = +(f * kp_lo - g * jp_ln + h * jo_kn);
        var a12 = -(e * kp_lo - g * ip_lm + h * io_km);
        var a13 = +(e * jp_ln - f * ip_lm + h * in_jm);
        var a14 = -(e * jo_kn - f * io_km + g * in_jm);

        var det = a * a11 + b * a12 + c * a13 + d * a14;

        if (Math.abs(det) < 1e-8)
        {
            return null;
        }

        var invDet = 1.0 / det;

        var m11 = a11 * invDet;
        var m21 = a12 * invDet;
        var m31 = a13 * invDet;
        var m41 = a14 * invDet;

        var m12 = -(b * kp_lo - c * jp_ln + d * jo_kn) * invDet;
        var m22 = +(a * kp_lo - c * ip_lm + d * io_km) * invDet;
        var m32 = -(a * jp_ln - b * ip_lm + d * in_jm) * invDet;
        var m42 = +(a * jo_kn - b * io_km + c * in_jm) * invDet;

        var gp_ho = g * p - h * o;
        var fp_hn = f * p - h * n;
        var fo_gn = f * o - g * n;
        var ep_hm = e * p - h * m;
        var eo_gm = e * o - g * m;
        var en_fm = e * n - f * m;

        var m13 = +(b * gp_ho - c * fp_hn + d * fo_gn) * invDet;
        var m23 = -(a * gp_ho - c * ep_hm + d * eo_gm) * invDet;
        var m33 = +(a * fp_hn - b * ep_hm + d * en_fm) * invDet;
        var m43 = -(a * fo_gn - b * eo_gm + c * en_fm) * invDet;

        var gl_hk = g * l - h * k;
        var fl_hj = f * l - h * j;
        var fk_gj = f * k - g * j;
        var el_hi = e * l - h * i;
        var ek_gi = e * k - g * i;
        var ej_fi = e * j - f * i;

        var m14 = -(b * gl_hk - c * fl_hj + d * fk_gj) * invDet;
        var m24 = +(a * gl_hk - c * el_hi + d * ek_gi) * invDet;
        var m34 = -(a * fl_hj - b * el_hi + d * ej_fi) * invDet;
        var m44 = +(a * fk_gj - b * ek_gi + c * ej_fi) * invDet;

        return new Matrix(
            m11, m12, m13, m14,
            m21, m22, m23, m24,
            m31, m32, m33, m34,
            m41, m42, m43, m44);
    }

    private static _identity = new Matrix(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
}