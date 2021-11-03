import {DEFAULT_SIZE,
        LED_LIGHT_RADIUS,
        LED_WIDTH} from "core/utils/Constants";

import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";


@serializable("Oscilloscope")
export class Oscilloscope extends DigitalComponent {
    private signals: boolean[];

    public constructor() {
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(400, 200));
    }

    public tick(): void {
        if (this.designer !== undefined)
            this.designer.forceUpdate();

        window.setTimeout(() => {
            this.tick();
        }, this.frequency);
    }

    public getDisplayName(): string {
        return "Oscilloscope";
    }
}
