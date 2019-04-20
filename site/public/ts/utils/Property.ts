
export class Property<T> {
    private value: T;

    private set: boolean;
    private disabled: boolean;

    public constructor(initialValue: T, disabled: boolean = false) {
        this.value = initialValue;
        this.set = false;
        this.disabled = disabled;
    }

    public setValue(val: T, set: boolean = true): void {
        this.value = val;
        this.set = set;
    }

    public setDisabled(disabled: boolean): void {
        this.disabled = disabled;
    }

    public getValue(): T {
        return this.value;
    }

    public isSet(): boolean {
        return this.set;
    }

    public isDisabled(): boolean {
        return this.disabled;
    }

    public copy(): Property<T> {
        const copy = new Property<T>(this.value, this.disabled);
        copy.set = this.set;
        return copy;
    }

}
