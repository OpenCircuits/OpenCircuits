import {serializable} from "serialeazy";

import {V, Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {AnalogComponent, GenInitialInfo, Prop, PropInfo} from "analog/models/AnalogComponent";
import {SidePositioner} from "analog/models/ports/positioners/SidePositioner";


const Info: Record<string, PropInfo> = {
    "samples": {
        type: "int",
        display: "Samples",
        initial: 100, min: 0, step: 20,
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
    private enabledVecs: Array<`${string}.${string}`>;

    public constructor() {
        super(
            new ClampedValue(1),
            V(400, 200), new SidePositioner("left"),
            GenInitialInfo(Info),
        );

        this.enabledVecs = [];
    }

    public setEnabledVecs(plots: typeof this.enabledVecs) {
        this.enabledVecs = plots;
    }

    public enableVec(key: `${string}.${string}`) {
        this.enabledVecs.push(key);
    }

    public disableVec(key: `${string}.${string}`) {
        this.enabledVecs.splice(this.enabledVecs.indexOf(key), 1);
    }

    public getEnabledVecs() {
        return this.enabledVecs;
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "size") {
            this.setSize(val as Vector);
            this.ports.updatePortPositions();
        }
    }

    public override getPropInfo(key: string): PropInfo {
        return Info[key];
    }

    public override getDisplayName(): string {
        return "Oscilloscope";
    }
}
