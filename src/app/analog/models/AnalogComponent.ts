import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";
import {Prop}      from "core/models/PropInfo";

import {PortSet} from "core/models/ports/PortSets";

import {Positioner} from "core/models/ports/positioners/Positioner";

import {NetlistElement} from "./sim/Netlist";

import {AnalogCircuitDesigner, AnalogPort, AnalogWire} from "./index";


export abstract class AnalogComponent extends Component {
    @serialize
    protected designer?: AnalogCircuitDesigner;

    @serialize
    protected ports: PortSet<AnalogPort>;


    protected constructor(portCount: ClampedValue, size: Vector,
                          portPositioner: Positioner<AnalogPort> = new Positioner<AnalogPort>("left"),
                          initialProps: Record<string, Prop> = {}) {
        super(size, initialProps);

        this.ports = new PortSet<AnalogPort>(this, portCount, portPositioner, AnalogPort);
    }

    public setDesigner(designer?: AnalogCircuitDesigner): void {
        this.designer = designer;
    }

    public setPortCount(val: number): void {
        this.ports.setPortCount(val);
        this.onTransformChange();
    }

    public getNetlistSymbol(): NetlistElement["symbol"] | undefined {
        return undefined;
    }

    public getNetlistValues(): NetlistElement["values"] {
        return [];
    }

    public getPort(i: number): AnalogPort {
        return this.ports.get(i);
    }

    public getPortPos(i: number): Vector {
        return this.getPort(i).getWorldTargetPos();
    }

    public getPorts(): AnalogPort[] {
        return this.ports.getPorts();
    }

    public getPortCount(): ClampedValue {
        return this.ports.getCount();
    }

    public numPorts(): number {
        return this.ports.length;
    }

    public override getConnections(): AnalogWire[] {
        // Get each wire connected to each port and then filter out the null ones
        return this.getPorts().flatMap((p) => p.getWires())
                .filter((w) => !!w);
    }

    public getDesigner(): AnalogCircuitDesigner | undefined {
        return this.designer;
    }

}
