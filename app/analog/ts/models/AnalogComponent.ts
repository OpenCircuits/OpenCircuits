import {Component} from "core/models/Component";
import {AnalogCircuitDesigner} from "./AnalogCircuitDesigner";
import {Port} from "core/models/ports/Port";
import {ClampedValue} from "math/ClampedValue";
import {Vector} from "Vector";
import {Positioner} from "core/models/ports/positioners/Positioner";
import {AnalogWire} from "./AnalogWire";
import {AnalogPort, AnalogPortSet} from "./ports/AnalogPort";

export abstract class AnalogComponent extends Component {
    protected designer: AnalogCircuitDesigner;

    protected ports: AnalogPortSet;

    protected constructor(portCount: ClampedValue, size: Vector, positioner?: Positioner<AnalogPort>) {
        super(size);

        this.ports = new AnalogPortSet(this, portCount, positioner);
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

    public copy(): AnalogComponent {
        const copy = <AnalogComponent>super.copy();

        copy.ports = this.ports.copy(copy);

        return copy;
    }

}