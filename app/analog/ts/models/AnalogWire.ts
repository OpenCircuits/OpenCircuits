import {serializable, serialize} from "serialeazy";

import {Wire} from "core/models/Wire";

import {AnalogPort} from "./ports/AnalogPort";
import {AnalogNode} from "./eeobjects/AnalogNode";

@serializable("AnalogWire")
export class AnalogWire extends Wire {

    protected current: number;
    protected voltage: number;

    @serialize
    protected p1: AnalogPort;
    @serialize
    protected p2: AnalogPort;

    public constructor(p1?: AnalogPort, p2?: AnalogPort) {
        super(p1, p2);
    }

    public split(): AnalogNode {
        return new AnalogNode();
    }

}
