import {serialize} from "serialeazy";

import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";
import {PortSet} from "core/models/ports/PortSets";
import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogPort} from "./ports/AnalogPort";
import {AnalogCircuitDesigner} from "./AnalogCircuitDesigner";
import {AnalogWire} from "./AnalogWire";

export abstract class AnalogComponent extends Component {
    @serialize
    protected designer: AnalogCircuitDesigner;

    @serialize
    protected ports: PortSet<AnalogPort>;

    public voltage: number;
    public current: number;
    public resistance: number;

    protected constructor(portCount: ClampedValue, size: Vector, positioner?: Positioner<AnalogPort>) {
        super(size);

        this.ports = new PortSet<AnalogPort>(this, portCount, positioner, AnalogPort);
    }

    public setDesigner(designer?: AnalogCircuitDesigner): void {
        this.designer = designer;
    }

    public getPorts(): AnalogPort[] {
        return this.ports.getPorts();
    }

    public getConnections(): AnalogWire[] {
        return this.getPorts().flatMap(p => p.getWires());
    }

    public getDesigner(): AnalogCircuitDesigner {
        return this.designer;
    }
}
