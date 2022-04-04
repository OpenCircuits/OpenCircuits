import {serialize} from "serialeazy";

import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";

import {PortSet} from "core/models/ports/PortSets";
import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogCircuitDesigner, AnalogWire, AnalogPort} from "./index";


export type Prop = number | string | boolean;
export type BasePropInfo = {
    display: string;
}
export type NumberPropInfo = BasePropInfo & {
    type: "int" | "float";
    min?: number;
    max?: number;
    step?: number;
}
export type StringPropInfo = BasePropInfo & {
    type: "string";
    constraint?: RegExp;
}
export type ColorPropInfo = BasePropInfo & {
    type: "color";
}
export type PropInfo = NumberPropInfo | StringPropInfo | ColorPropInfo;

export abstract class AnalogComponent extends Component {
    @serialize
    protected designer?: AnalogCircuitDesigner;

    @serialize
    protected ports: PortSet<AnalogPort>;

    @serialize
    protected props: Record<string, Prop>;


    protected constructor(portCount: ClampedValue, size: Vector,
                          portPositioner: Positioner<AnalogPort> = new Positioner<AnalogPort>("left"),
                          initialProps: Record<string, Prop> = {}) {
        super(size);

        this.ports = new PortSet<AnalogPort>(this, portCount, portPositioner, AnalogPort);
        this.props = initialProps;
    }

    public setDesigner(designer?: AnalogCircuitDesigner): void {
        this.designer = designer;
    }

    public setProp(key: string, val: Prop) {
        const prop = this.props[key];
        if (prop === undefined)
            throw new Error(`Can't find property: ${key} in ${this.getName()}!` +
                            `My props: ${Object.entries(this.props).join(",")}`);

        this.props[key] = val;
    }

    public setPortCount(val: number): void {
        this.ports.setPortCount(val);
        this.onTransformChange();
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

    public getConnections(): AnalogWire[] {
        // Get each wire connected to each port and then filter out the null ones
        return this.getPorts().flatMap((p) => p.getWires())
                .filter((w) => w != null);
    }

    public hasProp(key: string): boolean {
        return (key in this.props);
    }

    public getProp(key: string): Prop {
        return this.props[key];
    }

    public getProps() {
        return this.props;
    }

    public getPropInfo(_key: string): PropInfo | undefined {
        return undefined;
    }

    public getDesigner(): AnalogCircuitDesigner | undefined {
        return this.designer;
    }

}
