import {DEFAULT_SIZE,
        LED_LIGHT_RADIUS,
        LED_WIDTH} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";

@serializable("LED")
export class LED extends DigitalComponent {
    @serialize
    private color: string;

    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(50, 50));
        this.color = "#ffffff";

        // Make port face down instead of sideways
        this.inputs.first.setOriginPos(V());
        this.inputs.first.setTargetPos(V(0, 2*DEFAULT_SIZE));
    }

    // @Override
    public activate(signal: boolean, i: number = 0): void {
        this.onTransformChange();
        super.activate(signal, i);
    }

    // @Override
    public getOffset(): Vector {
        // Add extra offset if this LED is on (to account for light)
        return super.getOffset().add((this.isOn() ? (LED_LIGHT_RADIUS - LED_WIDTH/2) : (0)));
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
}
