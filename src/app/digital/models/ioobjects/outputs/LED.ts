import {serializable} from "serialeazy";

import {LED_LIGHT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {GenPropInfo} from "core/utils/PropInfoUtils";

import {DigitalComponent} from "digital/models/DigitalComponent";


const [Info, InitialInfo] = GenPropInfo({
    infos: {
        "color": {
            type:    "color",
            label:   "Color",
            initial: "#ffffff",
        },
    },
});

/**
 * The LED turns on when signal input connnected to it is 1.
 * Outputs a bright light.
 */
@serializable("LED")
export class LED extends DigitalComponent {

    /**
     * Initializes LED, has clamped value of 0 and 1 inputs.
     */
    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(1, 1), undefined, undefined,
              InitialInfo);

        // Make port face down instead of sideways
        this.inputs.first.setOriginPos(V());
        this.inputs.first.setTargetPos(V(0, -2));
    }

    /**
     * Turn the LED on.
     *
     * @param signal Signal connected to the LED (on or off).
     * @param i      The output port index.
     */
    public override activate(signal: boolean, i = 0): void {
        this.onTransformChange();
        super.activate(signal, i);
    }

    /**
     * Returns offset of light radius when LED is on, if the LED is off, there is no offset to return (0).
     *
     * @returns Gets extra offset of light radius if LED is on.
     */
    public override getOffset(): Vector {
        // Add extra offset if this LED is on (to account for light)
        return super.getOffset().add((this.isOn() ? (LED_LIGHT_RADIUS - this.getSize().x/2) : (0)));
    }

    /**
     * Returns true (1) if LED is on.
     *
     * @returns Light status of LED.
     */
    public isOn(): boolean {
        return this.inputs.first.getIsOn();
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    /**
     * Returns the display name of the LED.
     *
     * @returns Display name of the LED.
     */
    public getDisplayName(): string {
        return "LED";
    }

    /**
     * Returns the image name of the LED in the off state.
     *
     * @returns Image name of the LED (OFF).
     */
    public override getImageName(): string {
        return "led.svg";
    }

    /**
     * Returns the image name of the LED in the on state.
     *
     * @returns Image name of the LED (ON).
     */
    public getOnImageName(): string {
        return "ledLight.svg"
    }
}
