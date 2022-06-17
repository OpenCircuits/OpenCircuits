import {serialize} from "serialeazy";

import {Vector} from "Vector";
import {ClampedValue} from "math/ClampedValue";

import {Component} from "core/models/Component";

import {PortSet} from "core/models/ports/PortSets";
import {Positioner} from "core/models/ports/positioners/Positioner";

import {AnalogCircuitDesigner, AnalogPort, AnalogWire} from "./index";
import {NetlistElement} from "./sim/Netlist";


export type UnitInfo = Record<string, {
    name: string;
    display: string;
    val: number;
}>;


export type Prop = number | string | Vector | boolean;
export type BasePropInfo = {
    readonly?: boolean;
    display: string | ((state: Record<string, Prop>) => string);

    isActive?: (state: Record<string, Prop>) => boolean;
}
export type NumberPropInfo = BasePropInfo & {
    type: "int" | "float";
    initial: number;
    unit?: UnitInfo;
    min?: number;
    max?: number;
    step?: number;
}
export type VectorPropInfo = BasePropInfo & {
    type: "veci" | "vecf";
    initial: Vector;
    min?: Vector;
    max?: Vector;
    step?: Vector;
}
export type StringPropInfo = BasePropInfo & {
    type: "string";
    initial: string;
    constraint?: RegExp; // TODO: use this
}
export type ColorPropInfo = BasePropInfo & {
    type: "color";
    initial: string;
}
export type StringSelectPropInfo = BasePropInfo & {
    type: "string[]";
    initial: string;
    options: Array<[
        string, // Display value
        string, // Option value
    ]>;
}
export type NumberSelectPropInfo = BasePropInfo & {
    type: "number[]";
    initial: number;
    options: Array<[
        string, // Display value
        number, // Option value
    ]>;
}
export type PropInfo =
    | NumberPropInfo | StringPropInfo | ColorPropInfo
    | StringSelectPropInfo | NumberSelectPropInfo | VectorPropInfo;

export type GroupPropInfo = {
    type: "group";

    readonly?: boolean;
    isActive?: (state: Record<string, Prop>) => boolean;

    infos: Record<string, PropInfo>;
    subgroups?: GroupPropInfo[];
}
export const GenPropInfo = (groups: GroupPropInfo[]): Record<string, PropInfo> => {
    const allInfos: Record<string, PropInfo[]> = {};

    const merge = (a1: GroupPropInfo["isActive"], a2: GroupPropInfo["isActive"]): GroupPropInfo["isActive"] => {
        if (a1 && a2) {
            return (state) => (a1(state) && a2(state));
        }
            return a1 ?? a2;

    }

    const collectGroups = (groups: GroupPropInfo[], parentIsActive?: GroupPropInfo["isActive"]): void => {
        groups.forEach((group) => {
            const { isActive, infos, subgroups } = group;

            // Merge isActive w/ parentIsActive
            const groupIsActive = merge(isActive, parentIsActive);

            Object.entries(infos).forEach(([key, info]) => {
                if (!(key in allInfos))
                    allInfos[key] = [];
                allInfos[key].push(info);

                // Merge isActive with groupIsActive
                info.isActive = merge(info.isActive, groupIsActive);
            });
            collectGroups(subgroups ?? [], groupIsActive);
        });
    }
    collectGroups(groups);


    // Combine multi-infos together
    const info: Record<string, PropInfo> = {};

    Object.entries(allInfos).forEach(([key, infos]) => {
        const info0 = { ...infos[0] };
        info[key] = info0;

        // If exactly one info, then no need to merge
        if (infos.length === 1)
            return;

        // Merge displays
        if (infos.some(i => i.display !== info0.display)) {
            info0.display = (state) => {
                // Display based on isActive of the infos
                const display = infos.find((i) => (i.isActive?.(state) ?? true))?.display ?? "";
                return (
                    typeof display === "string"
                    ? display
                    : display(state)
                );
            }
        }

        // Merge isActives via union
        if (infos.some(i => !!i.isActive)) {
            // isActive if at least one of the infos is active
            info0.isActive = (state) => infos.some((i) => (i.isActive?.(state) ?? true));
        }
    });

    return info;
}


export const GenInitialInfo = (info: Record<string, PropInfo>): Record<string, Prop> => {
    return Object.fromEntries(
        Object.entries(info)
            .map(([key, info]) => [key, info.initial])
    );
}


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

    public getConnections(): AnalogWire[] {
        // Get each wire connected to each port and then filter out the null ones
        return this.getPorts().flatMap((p) => p.getWires())
                .filter(w => !!w);
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
