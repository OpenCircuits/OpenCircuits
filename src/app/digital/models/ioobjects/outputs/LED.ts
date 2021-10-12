import {DEFAULT_SIZE,
        LED_LIGHT_RADIUS,
        LED_WIDTH} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";

/**
 * The LED turns on when signal input connnected to it is 1
 * 
 * Outputs a bright light
 * 
 */

@serializable("LED")
export class LED extends DigitalComponent {
    @serialize
    private color: string;

    /**
     * initializes LED, has clamped value of 0 and 1 inputs
     */
    
    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(50, 50));
        this.color = "#ffffff";

        // Make port face down instead of sideways
        this.inputs.first.setOriginPos(V());
        this.inputs.first.setTargetPos(V(0, 2*DEFAULT_SIZE));
    }

    /**
     * Turn the LED on
     * @param signal  signal connected to the LED (on or off)
     * @param i output port
     */
    public activate(signal: boolean, i: number = 0): void {
        this.onTransformChange();
        super.activate(signal, i);
    }

    /**
     * 
     * @returns adds extra offset if LED is on
     */
    public getOffset(): Vector {
        // Add extra offset if this LED is on (to account for light)
        return super.getOffset().add((this.isOn() ? (LED_LIGHT_RADIUS - LED_WIDTH/2) : (0)));
    }

    /**
     * sets the color of the LED
     * @param color inputs a color
     */
    public setColor(color: string): void {
        this.color = color;
    }

    /**
     * 
     * @returns light status of LED
     */

    public isOn(): boolean {
        return this.inputs.first.getIsOn();
    }
    /**
     * 
     * @returns color of the LED
     */
    public getColor(): string {
        return this.color;
    }
    /**
     * 
     * @returns displayname of the LED
     */
    public getDisplayName(): string {
        return "LED";
    }
    /**
     * 
     * @returns image name of the LED (OFF)
     */
    public getImageName(): string {
        return "led.svg";
    }

    /**
     * 
     * @returns image name of the LED (ON)
     */
    public getOnImageName(): string {
        return "ledLight.svg"
    }
}
