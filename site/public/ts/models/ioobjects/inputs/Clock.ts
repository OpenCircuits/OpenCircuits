import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class Clock extends Component {
    private frequency: number;
    private isOn: boolean;
    private img: string;

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(60, 42));
        this.frequency = 1000;
        this.isOn = false;
        this.tick();
    }

    // Changing the clock
    public tick() {
        this.activate(!this.isOn);
        setTimeout(() => this.tick(), this.frequency);
    }

    public setFrequency(freq: number) {
        this.frequency = freq * 1000;
    }

    public getFrequency() {
        return this.frequency;
    }

    // Activate changes state and image
    public activate(bool: boolean) {
        super.activate(bool);
        this.isOn = bool;
        if (this.designer != undefined)
            this.designer.forceUpdate();
    }

    public getDisplayName() {
        return "Clock";
    }

    public getXMLName() {
        return "clock";
    }

    public getImageName() {
        return (this.isOn ? "clockOn.svg" : "clock.svg");
    }
}
