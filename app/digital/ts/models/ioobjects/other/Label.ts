import {V} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {DigitalComponent} from "digital/models/DigitalComponent";
import {serializable} from "serialeazy";

@serializable("Label")
export class Label extends DigitalComponent {
    
    private color: string;

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(0), V(60, 30));
        this.color = "#ffffff"; 
    }

    public getDisplayName(): string {
        return "LABEL";
    }

    public getColor(): string {
        return this.color;
    }

    public setColor(color: string): void {
        this.color = color;
    }

}
