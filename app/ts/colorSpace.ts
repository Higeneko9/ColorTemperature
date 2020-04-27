/**
 * Class represents a RGB color
 * @description This class holds RGB channel value usually between 0.0 to 1.0.
 */
class RgbColor {
    /**
     * @description Create an instace of RgbColor object from given color.
     *
     * @param r {number} Red channel value asldkfjhlkasjdfhlkjh
     * @param g {number} Green channel value
     * @param b {number} Blue channel value
     */
    constructor(public r : number, public g : number, public b: number){}

    /**
     * @description Create a RgbColor from given CSS rgb string.
     *
     * @param      rgbText {string} The rgb string 'rgb(10, 20, 30)' to be converted.
     *
     * @return     {RgbColor} The converted RgbColor.
     */
    static fromCssRgb(rgbText: string) : RgbColor {

        var rgb = rgbText.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
        return new RgbColor(
            parseInt(rgb[1], 10) / 255.0,
            parseInt(rgb[2], 10) / 255.0,
            parseInt(rgb[3], 10) / 255.0
        );
    }

    /**
     * @description Create a RgbColor from given HSV values.
     *
     * @param      h {numnumber} The Hue value [0 - 360).
     * @param      s {numnumber} The Saturation value [0 - 100].
     * @param      v {numnumber} The Value value [0 - 100].
     *
     * @return     {RgbColor} The converted RgbColor.
     */
    static fromHsv(h:number, s:number, v:number) : RgbColor {

        // Normalize input values.
        while (h >= 360.0) h -= 360.0;
        while (h < 0) h += 360.0;
        h = MathHelper.saturate(h / 360.0);
        s = MathHelper.saturate(s / 100.0);
        v = MathHelper.saturate(v / 100.0);

        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);

        var r: number, g: number, b: number;
        switch (i % 6) {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        } 

        return new RgbColor(r, g, b);
    }

    /**
     * @description Clamps the specified RGB color within the range of 0 to 1.
     *
     * @param      rgbColor {RgbColor} The RGB color.
     *
     * @return     {RgbColor} The clampled RGB color.
     */
    static saturate(rgbColor: RgbColor) : RgbColor {
        return new RgbColor(
            Math.max(0.0, Math.min(1.0, rgbColor.r)),
            Math.max(0.0, Math.min(1.0, rgbColor.g)),
            Math.max(0.0, Math.min(1.0, rgbColor.b)));
    }

    /**
     * Gets a hex color string like "#80aabb"
     */
    toHexString() : string {
        var r = Math.min(255, Math.max(0, Math.floor(this.r * 255)));
        var g = Math.min(255, Math.max(0, Math.floor(this.g * 255)));
        var b = Math.min(255, Math.max(0, Math.floor(this.b * 255)));
        return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

}

/**
 * class represents
 * {@link https://en.wikipedia.org/wiki/CIE_1931_color_space CIE XYZ} color space
 */
class CieXyzColor {

    /**
     * @description Create an instance of CieXyzColor from given x, y, and z
     *
     * @param      x {number} The X value
     * @param      y {number} The Y value
     * @param      z {number} The Z value
     */
    constructor(public x: number, public y: number, public z: number){}

    /**
     * @description Create CIE XYZ color form given CIE Chromaticity xy color
     * along with y value.
     *
     * @param      cieChromaticityXyColor  The cie chromaticity xy color
     * @param      y {number} The Y value for converted XYZ color.
     * @return     {CieXyzColor} Converted CIE XYZ color.
     */
    static fromCieChromaticityXy(
        cieChromaticityXyColor : CieChromaticityXyColor,
        y: number) : CieXyzColor {
        var xy = cieChromaticityXyColor;

        return new CieXyzColor(
            y / xy.y * xy.x,
            y,
            y / xy.y * (1.0 - xy.x - xy.y));
    }

    /**
     * @description Create CIE XYZ color from gvien CIE LAB color.
     *
     * @param      cieLabColor {CieLabColor} The CIE LAB color to be converted.
     * @return     {CieXyzColor} Converted CIE XYZ color.
     */
    static fromCieLab(cieLabColor: CieLabColor) : CieXyzColor {

        // Reference: https://en.wikipedia.org/wiki/Lab_color_space#CIELAB-CIEXYZ_conversions
        const c1 = 6 / 29;
        const c2 = 3 * c1 * c1;
        const c3 = 4 / 29;

        var l = 1 / 116 * (cieLabColor.l + 16);

        var x = l + 1 / 500 * cieLabColor.a;
        var y = l;
        var z = l - 1 / 200 * cieLabColor.b;

        x = x > c1 ? x * x * x : c2 * (x - c3);
        y = y > c1 ? y * y * y : c2 * (y - c3);
        z = z > c1 ? z * z * z : c2 * (z - c3);

        return new CieXyzColor(95.047 * x, 100.0 * y, 108.883 * z);
    }

    /**
     * @description Convert to CIE LAB color.
     *
     * @return {CieLabColor} Converted CIE LAB color.
     */
    toCieLab() : CieLabColor { return CieLabColor.fromCieXyz(this); }

}

/**
 * class represents {@link https://en.wikipedia.org/wiki/CIE_1931_color_space CIE chromaticity xy } color.
 */
class CieChromaticityXyColor{

    /**
     * @description Create an instance of CieChromaticityXyColor from given x, y.    *
     * @param      x {number} The x value
     * @param      y {number} The y value
     */
    constructor(public x:number, public y: number){}

    /**
     * @description Create CIE chromaticity xy color from given color temperature.
     *
     * @param      kelvin {number} The color temperature in Kelvin.
     * @return     {CieChromaticityXyColor} The CIE chromaticity xy color.
     */
    static fromTemperature(kelvin : number) : CieChromaticityXyColor {
        var t = kelvin;
        var t2 = t * t;

        // Convert to CIE 1960 UCS first
        // https://en.wikipedia.org/wiki/Planckian_locus#Approximation
        var u =
            (0.860117757 + 1.54118254 * 1e-4 * t + 1.28641212 * 1e-7 * t2) /
            (1 + 8.42420235 * 1e-4 * t + 7.08145163 * 1e-7 * t2);
        var v =
            (0.317398726 + 4.22806245 * 1e-5 * t + 4.20481691 * 1e-8 * t2) /
            (1 - 2.89741816 * 1e-5 * t + 1.61456053 * 1e-7 * t2);

        // Then convert to CIE xy chromaticity.
        var d = 2 * u - 8 * v + 4;

        return new CieChromaticityXyColor(3 * u / d, 2 * v / d);
    }

    
    /**
     * @description Convert to CIE XYZ color with given Y value.
     *
     * @param      y {number} Y value of Converted CIE XYZ color.
     *
     * @return     {CieXyzColor} Converted CIE XYZ color.
     */
    toCieXyz(y: number) : CieXyzColor {
        return CieXyzColor.fromCieChromaticityXy(this, y);
    }

}

/**
 * class represents {@link https://en.wikipedia.org/wiki/Lab_color_space CIE LAB} color
 */
class CieLabColor {
    /**
     * @description Create an CieLabColor from given l, a, and b value
     *
     * @param      l {number} The lightness value (0-100)
     * @param      a {number} The a vlaue (-128 to 127)
     * @param      b {number} The b value (-127 to 127)
     */
    constructor(public l: number, public a: number, public b: number){}

    /**
     * @description Convert given CIE XYZ color to CIE LAB color.
     *
     * @param      cieXyzColor {CieXyzColor} The CIE XYZ color to be converted.
     * @return     {cieLabColor} The converted CIE LAB color.
     */
    static fromCieXyz(cieXyzColor : CieXyzColor) : CieLabColor {
        // Reference: https://en.wikipedia.org/wiki/Lab_color_space#CIELAB-CIEXYZ_conversions
        const c1 = (6 / 29) ** 3; // (6/29)^3
        const c2 = ((29 / 6) ** 2) / 3; // 1/3 *  (29/6)^2

        var x = cieXyzColor.x / 95.047;
        var y = cieXyzColor.y / 100.0;
        var z = cieXyzColor.z / 108.883;

        x = x > c1 ? x ** (1 / 3) : c2 * x + 4 / 29;
        y = y > c1 ? y ** (1 / 3) : c2 * y + 4 / 29;
        z = z > c1 ? z ** (1 / 3) : c2 * z + 4 / 29;

        return new CieLabColor(116 * y - 16, 500 * (x - y), 200 * (y - z));
    }

    /**
     * @description Convert to CIE XYZ color.
     *
     * @return     {CieXyzColor} Converted CIE XYZ color.
     */
    toCieXyz() : CieXyzColor { return CieXyzColor.fromCieLab(this); }
}

class HsvColor {
    constructor(public h : number, public s : number, public v: number){}
}

/**
 * The Class provides color space operation methods.
 */
class ColorSpace {

    /**
     * @description Convert given CIE XYZ color to Linear sRGB.
     *
     * @param      cieXyzColor {CieXyzColor} The CIE XYZ color to be converted.
     *
     * @return     {RgbColor} The converted Linear sRGB color.
     */
    static cieXyzToLinearSrgb(cieXyzColor : CieXyzColor) : RgbColor {

        var v = Vector3.Transform(
            new Vector3(cieXyzColor.x, cieXyzColor.y, cieXyzColor.z),
            ColorSpace._xyzToLinearSrgb);

        return new RgbColor(v.x, v.y, v.z);
    }

    /**
     * @description Convert given Linear sRGB color to CIE XYZ color.
     *
     * @param      rgbColor {RgbColor} The Linear sRGB color to be converted.
     *
     * @return     {CieXyzColor} The converted CIE XYZ color.
     */
    static linearSrgbToCieXyz(rgbColor : RgbColor) : CieXyzColor {

        var v = Vector3.Transform(
            new Vector3(rgbColor.r, rgbColor.g, rgbColor.b),
            ColorSpace._linearSrgbToXyz);

        return new CieXyzColor(v.x, v.y, v.z);
    }

    /**
     * @description Calculates the color space conversion matrix from given RGB tristimuls values.
     *
     * @param red {CieChromaticityXyColor} The red value of RGB tristimulus in CIE chromaticity color space.
     * @param green {CieChromaticityXyColor} The green value of RGB tristimulus in CIE chromaticity color space.
     * @param blue {CieChromaticityXyColor} The blue value of RGB tristimulus in CIE chromaticity color space.
     * @param white {CieChromaticityXyColor} The white value of RGB tristimulus in CIE chromaticity color space.
     *
     * @return {Matrix} The color space conversion matrix.
     */
    static computeColorSpaceConversionMatrix(
        red: CieChromaticityXyColor,
        green: CieChromaticityXyColor,
        blue: CieChromaticityXyColor,
        white: CieChromaticityXyColor) : Matrix {

        // Reference: http://www.ryanjuckett.com/programming/rgb-color-space-conversion/
        // Generate xyz chroicity coordinates (x  + z = 1) from xy coordinates
        var r = new Vector3(red.x, red.y, 1 - (red.x + red.y));
        var g = new Vector3(green.x, green.y, 1 - (green.x + green.y));
        var b = new Vector3(blue.x, blue.y, 1 - (blue.x + blue.y));
        var w = new Vector3(white.x, white.y, 1 - (white.x + white.y));

       // Convert white  coordinate to XYZ coordinate by letting that the white
        // point have and XYZ relative luminance of 1.0. Relative luminance is the Y
        // component of and XYZ color.
        //   XYZ = xyz * (Y / y) 
        w.x /= white.y;
        w.y /= white.y;
        w.z /= white.y;

        // Solve for the transformation matrix 'M' from RGB to XYZ
        // * We know that the columns of M are equal to the unknown XYZ values of r, g and b.
        // * We know that the XYZ values of r, g and b are each a scaled version of the known
        //   corresponding xyz chromaticity values.
        // * We know the XYZ value of white based on its xyz value and the assigned relative
        //   luminance of 1.0.
        // * We know the RGB value of white is (1,1,1).
        //                  
        //   white_XYZ = M * white_RGB
        //
        //       [r.x g.x b.x]
        //   N = [r.y g.y b.y]
        //       [r.z g.z b.z]
        //
        //       [sR 0  0 ]
        //   S = [0  sG 0 ]
        //       [0  0  sB]
        //
        //   M = N * S
        //   white_XYZ = N * S * white_RGB
        //   N^-1 * white_XYZ = S * white_RGB = (sR,sG,sB)
        //
        // We now have an equation for the components of the scale matrix 'S' and
        // can compute 'M' from 'N' and 'S'
        var m = new Matrix(
            r.x, r.y, r.z, 0,
            g.x, g.y, g.z, 0,
            b.x, b.y, b.z, 0,
            0, 0, 0, 1
        );

        var invMtx = Matrix.Invert(m);
        var scale = Vector3.TransformNormal(w, invMtx);

        m.m11 *= scale.x;
        m.m12 *= scale.x;
        m.m13 *= scale.x;
        m.m21 *= scale.y;
        m.m22 *= scale.y;
        m.m23 *= scale.y;
        m.m31 *= scale.z;
        m.m32 *= scale.z;
        m.m33 *= scale.z;

        return m;
    }

    private static _linearSrgbToXyz : Matrix = 
        ColorSpace.computeColorSpaceConversionMatrix(
            new CieChromaticityXyColor(0.64, 0.33),
            new CieChromaticityXyColor(0.3, 0.6),
            new CieChromaticityXyColor(0.15, 0.06),
            new CieChromaticityXyColor(0.3127, 0.3290));

    private static _xyzToLinearSrgb : Matrix = Matrix.Invert(ColorSpace._linearSrgbToXyz);
}