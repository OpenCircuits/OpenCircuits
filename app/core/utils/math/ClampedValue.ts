import {Clamp} from "./math/MathUtils";

export class ClampedValue {
    private value: number;
    private minValue: number;
    private maxValue: number;

    public constructor(initialValue: number);
    public constructor(initialValue: number, minValue: number, maxValue: number);
    public constructor(initialValue: number, minValue?: number, maxValue?: number) {
        this.value = initialValue;
        this.minValue = minValue || initialValue; // if min not given use initial
        this.maxValue = maxValue || initialValue; // if max not given use initial
    }

    public setValue(val: number): void {
        this.value = Clamp(val, this.minValue, this.maxValue);
    }

    public setMinValue(val: number): void {
        this.minValue = val;
    }

    public setMaxValue(val: number): void {
        this.maxValue = val;
    }

    public getValue(): number {
        return this.value;
    }

    public getMinValue(): number {
        return this.minValue;
    }

    public getMaxValue(): number {
        return this.maxValue;
    }
    
    public copy(): ClampedValue {
        return new ClampedValue(this.value, this.minValue, this.maxValue);
    }

}
