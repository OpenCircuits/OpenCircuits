import {serializable, serialize} from "serialeazy";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, GenInitialInfo, Prop, PropInfo} from "analog/models/AnalogComponent";
import {SidePositioner} from "analog/models/ports/positioners/SidePositioner";


const Info: Record<string, PropInfo> = {
    "samples": {
        type: "int",
        display: "Samples",
        initial: 100, min: 0,
    },
    "size": {
        type: "veci",
        display: "Display Size",
        initial: V(400, 200),
        min: V(50, 50), step: V(50, 50),
    },
};

@serializable("Oscilloscope")
export class Oscilloscope extends AnalogComponent {
    @serialize
    private data: Record<string, number[]>;

    public constructor() {
        super(
            new ClampedValue(1),
            V(400, 200), new SidePositioner("left"),
            GenInitialInfo(Info),
        );
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "size") {
            this.setSize(val as Vector);
            this.ports.updatePortPositions();
        }
    }

    public getData() {
        return this.data;
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key];
    }

    public override getDisplayName(): string {
        return "Oscilloscope";
    }
}
