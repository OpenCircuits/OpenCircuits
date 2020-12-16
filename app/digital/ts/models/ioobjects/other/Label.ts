import {serializable, serialize} from "serialeazy";

import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";

@serializable("Label")
export class Label extends DigitalComponent {
    @serialize
    private color: string;
    @serialize
    private textColor: string;

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(0), V(60, 30));

        this.color = "#ffffff";
        this.textColor = "#000000";
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public setTextColor(textColor: string): void {
        this.textColor = textColor;
    }

    public getColor(): string {
        return this.color;
    }

    public getTextColor(): string {
        return this.textColor;
    }

    public getDisplayName(): string {
        return "LABEL";
    }

}
