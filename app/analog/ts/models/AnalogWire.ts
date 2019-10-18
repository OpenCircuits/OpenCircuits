import {Wire} from "core/models/Wire";
import {AnalogPort} from "./ports/AnalogPort";
import {AnalogNode} from "./eeobjects/AnalogNode";

export class AnalogWire extends Wire {
    protected p1: AnalogPort;
    protected p2: AnalogPort;

    private isOn: boolean;

    public constructor(p1: AnalogPort, p2: AnalogPort) {
        super(p1, p2);
    }

    public split(): AnalogNode {
        return new AnalogNode();
    }

    public getIsOn(): boolean {
        return this.isOn;
    }

}