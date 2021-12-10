import {Vector, V} from "Vector";
import {ClampedValue} from "math/ClampedValue";
import {serializable, serialize} from "serialeazy";

import {DigitalComponent} from "digital/models/DigitalComponent";

@serializable("Speaker")
export class DigitalSpeaker extends DigitalComponent {

    public constructor(){
        super(new ClampedValue(1),
              new ClampedValue(0),
              V(50, 50));
    }

    public getDisplayName(): string {
        return "Speaker";
    }

    public getImageName(): string {
        return "speaker.svg";
    }

    public isOn(): boolean {
        return this.inputs.first.getIsOn();
    }

}