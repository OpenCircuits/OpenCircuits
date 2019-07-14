import {DEFAULT_SIZE} from "../../../utils/Constants";

import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class LED extends Component {
    private color: string;

    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(50, 50));
        this.color = "#ffffff";

        // Make port face down instead of sideways
        this.inputs.first.setTargetPos(V(0, 2*DEFAULT_SIZE));
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public isOn(): boolean {
        return this.inputs.first.getIsOn();
    }

    public getColor(): string {
        return this.color;
    }

    public getDisplayName(): string {
        return "LED";
    }

    public getImageName(): string {
        return "led.svg";
    }

    public getOnImageName(): string {
        return "ledLight.svg"
    }

    public getXMLName(): string {
        return "led";
    }
}
