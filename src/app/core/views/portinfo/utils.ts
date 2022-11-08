import {V} from "Vector";

import {GetDebugInfo} from "core/utils/Debug";
import {MapObj}       from "core/utils/Functions";

import {AnyComponent, AnyPort} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {PortPos, PortPosConfig} from "./types";

import {AllPortInfo} from ".";


export function CalcPortConfigID(circuit: CircuitController, parent: AnyComponent) {
    const groups = circuit.getPortsFor(parent).map((p) => p.group);

    // Return the index of the config, found by checking the current number of ports
    //  in each group against each config to find a match
    return AllPortInfo[parent.kind].PositionConfigs.findIndex((cfg) => (
        Object.entries(cfg)
            .every(([key, vals]) => (vals.length === groups.filter((group) => (group === key)).length))
    ));
}

export function CalcPortAmounts(config: PortPosConfig): Record<string, number> {
    return MapObj(config, ([_, positions]) => positions.length);
}

export function GetPortPos(circuit: CircuitController, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const configID = CalcPortConfigID(circuit, parent);
    if (configID === -1)
        throw new Error(`GetPortPos: Failed to find a config for ${GetDebugInfo(parent)}`);
    return AllPortInfo[parent.kind].PositionConfigs[configID][port.group][port.index];
}

export function GetPortWorldPos(circuit: CircuitController, port: AnyPort): PortPos {
    const parent = circuit.getPortParent(port);
    const { origin, target, dir } = GetPortPos(circuit, port);
    return {
        origin: origin.rotate(parent.angle).add(V(parent.x, parent.y)),
        target: target.rotate(parent.angle).add(V(parent.x, parent.y)),
        dir:    dir.rotate(parent.angle),
    };
}
