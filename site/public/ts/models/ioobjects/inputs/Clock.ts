import {V} from "../../../utils/math/Vector";
import {ClampedValue} from "../../../utils/ClampedValue";
import {Component} from "../Component";

export class Clock extends Component {
    private frequency: number;
    private isOn: boolean;
    private img: string;

    public constructor() {
        super(new ClampedValue(0), new ClampedValue(1), V(60, 60));
        this.frequency = 1000;
        this.isOn = false;
        this.tick();
    }

    //changing the clock
    public tick() {
        this.activate(!this.isOn);
        setTimeout(() => this.tick(), this.frequency);
    }

    //stuff related to frequency
    public setFrequency(freq: number) {
        this.frequency = freq * 1000;
    }

    public getFrequency() {
        return this.frequency;
    }

    //activate changes state and image
    public activate(bool: boolean) {
        super.activate(bool);
        this.isOn = bool;
    }

    //general stuff for all objects
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
