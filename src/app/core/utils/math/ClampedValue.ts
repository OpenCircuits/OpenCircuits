import {serializable} from "serialeazy";

import {Clamp} from "./MathUtils";

/**
 * A class containing a number, functions to change the value of the number and
 * variables and functions that restrict the range of values the number can hold (aka clamping).
 * Commonly used to set the number of input ports for a component.
 */
@serializable("ClampedValue")
export class ClampedValue {
    /**
     * The current clamped value of the number.
     */
    private value: number;

    /**
     * The minimum value the number can hold.
     */
    private minValue: number;

    /**
     * The maximum value the number can hold.
     */
    private maxValue: number;

    /**
     * Set the initial value for a number to be clamped, minimum and maximum values unspecified.
     *
     * @param initialValue The inital value of the number.
     * @param minValue     The minimum value the number can hold.
     * @param maxValue     The maximum value the number can hold.
     */
    public constructor(initialValue?: number);

    /**
     * Set the initial value for a number and minimum and maximum values for clamping.
     *
     * @param initialValue The inital value of the number.
     * @param minValue     The minimum value the number can hold.
     * @param maxValue     The maximum value the number can hold.
     */
    public constructor(initialValue: number, minValue: number, maxValue: number);

    /**
     * Set the initial value for a number with minimum and maximum values for clamping equal to the intial.
     *
     * @param initialValue The initial value of the number.
     * @param minValue     The minimum value the number can hold.
     * @param maxValue     The maximum value the number can hold.
     */
    public constructor(initialValue?: number, minValue?: number, maxValue?: number) {
        this.value = initialValue!;
        this.minValue = minValue ?? initialValue!; // if min not given use initial
        this.maxValue = maxValue ?? initialValue!; // if max not given use initial
    }

    /**
     * Update the number to a new value, or the closest clamp bound if outside allowed range.
     *
     * @param  val The clamped value of the number.
     * @throws {Error} If this.minValue or this.maxValue are undefined.
     */
    public setValue(val: number): void {
        this.value = Clamp(val, this.minValue!, this.maxValue!);
    }

    /**
     * Set the minimum value the number can hold.
     *
     * @param val The minimum value the number can hold.
     */
    public setMinValue(val: number): void {
        this.minValue = val;
    }

    /**
     * Set the maximum value the number can hold.
     *
     * @param val The maximum value the number can hold.
     */
    public setMaxValue(val: number): void {
        this.maxValue = val;
    }

    /**
     * Returns the clamped value of the number.
     *
     * @returns The clamped value of the number.
     */
    public getValue(): number {
        return this.value;
    }

    /**
     * Returns the minimum value the number can hold.
     *
     * @returns The minimum value the number can hold.
     */
    public getMinValue(): number {
        return this.minValue;
    }

    /**
     * Returns the maximum value the number can hold.
     *
     * @returns The maximum value the number can hold.
     */
    public getMaxValue(): number {
        return this.maxValue;
    }

    /**
     * Checks whether the supplied value is within the bounds of this clamped value.
     *
     * @param value The number to evaluate.
     * @returns       True if value is between the minimum and maximum allowed values.
     */
    public contains(value: number): boolean {
        return (this.minValue <= value && this.maxValue >= value);
    }

    /**
     * Returns a new instance of the ClampedValue object, identical to the original.
     *
     * @returns A new instance of the ClampedValue object, identical to the original.
     */
    public copy(): ClampedValue {
        return new ClampedValue(this.value!, this.minValue!, this.maxValue!);
    }

}
