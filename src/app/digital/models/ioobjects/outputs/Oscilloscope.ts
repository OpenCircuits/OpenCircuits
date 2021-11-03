import {DEFAULT_SIZE,
        LED_LIGHT_RADIUS,
        LED_WIDTH} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";


const NUM_SEGMENTS = 100;


@serializable("Oscilloscope")
export class Oscilloscope extends DigitalComponent {
    private signals: boolean[];
    private frequency: number;

    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(400, 200));

        this.signals = [];
        this.frequency = 100;

        this.tick();
    }

    public tick(): void {
        // Add signal
        this.signals.push(this.inputs.first.getIsOn());
        if (this.signals.length > NUM_SEGMENTS)
            this.signals.splice(0, 1);

        if (this.designer !== undefined)
            this.designer.forceUpdate();

        window.setTimeout(() => {
            this.tick();
        }, this.frequency);
    }

    public getSignals(): boolean[] {
        return this.signals.slice();
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
