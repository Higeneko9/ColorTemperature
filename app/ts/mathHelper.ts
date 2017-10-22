/**
 * Contains commonly used precalculated values and utility methods.
 */
class MathHelper {

    /**
     * @description Represents the value of Pi. 
     */
    static Pi(): number { return MathHelper._pi; }

    /**
     * @description Represents the value of Pi times two. 
     */
    static TwoPi(): number { return MathHelper._twoPi; }

    /**
     * @description Represents the value of Pi divided by two. 
     */
    static PiOver2(): number { return MathHelper._piOver2; }

    /**
     * @description Represents the value of Pi divided by four. 
     */
    static PiOver4(): number { return MathHelper._piOver4; }

    /**
     * @description Converts degrees to radians.
     *
     * @param degree {number} The angle in degrees.
     * @return {number} The angle in radians.
     */
    static toRadians(degree: number): number {
        return degree * MathHelper._piOver180;
    }

    /**
     * @description Converts radians to degrees.
     *
     * @param radians {number} The angle in radians.
     * @return {number} The angle in degrees.
     */
    static toDegrees(radians: number): number {
        return radians * MathHelper._180OverPi;
    }

    /**
     * @description Linearly interpolates between two values.
     *
     * @param value1 {number} Source value.
     * @param value2 {number} Source value.
     * @param amount {number} Value between 0 and 1 indicating the weight of value2.
     * @return {number} Interpolated value.
     */
    static lerp(value1: number, value2: number, t:number){
        return value1 + (value2 - value1) * t;
    }

    /**
     * @description Clamp the specified value within the range of 0 to 1.
     *
     * @param value {number} The value to be clamped.
     * @return {number} Clamped value with in the range of 0 to 1.
     */
    static saturate(value: number){
        return Math.max(0, Math.min(value, 1));
    }

    /**
     * @description Clamp the specified value within a specified range.
     *
     * @param value {number} The value to be clamped.
     * @param minValue {number} The minimum value. If value is less than minValue, minValue will be returned.
     * @param maxValue {number} The maxsimum value. if value is greater than maxValue, maxValue  will be returned.
     * @return {number} Clamped value with in the range of minValue to maxValue.
     */
    static clamp(val: number, minValue: number, maxValue: number) {
        return Math.max(minValue, Math.min(val, maxValue));
    }

    private static readonly _pi: number = Math.PI;
    private static readonly _twoPi: number = Math.PI * 2.0;
    private static readonly _piOver2: number = Math.PI / 2.0;
    private static readonly _piOver4: number = Math.PI / 4.0;
    private static readonly _piOver180 : number = Math.PI / 180.0;
    private static readonly _180OverPi : number = 180.0 / Math.PI;
}