import {v4 as uuid} from "uuid";

import {Vector} from "Vector";

import {AllComponentInfo} from "core/models/info";
import {AnyObj}           from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";
import {PortInfo}          from "core/views/PortInfo";

import {Action}      from "../../actions/Action";
import {GroupAction} from "../../actions/GroupAction";
import {Place}       from "../../actions/units/Place";


export function CreateComponent(kind: keyof typeof AllComponentInfo, zIndex: number, compID = uuid()) {
    const info = AllComponentInfo[kind];

    // Create component
    const comp = info.Default(compID);

    // Create ports
    const portConfig = PortInfo[kind][info.PortInfo.InitialConfig];
    const ports = Object.keys(portConfig).map((s) => {
        const [group, index] = s.split(":").map((s) => parseInt(s));
        return info.PortInfo.Default(uuid(), compID, group, index);
    });

    // Set z-index
    [comp, ...ports].forEach((o) => (o.zIndex = zIndex));

    return [comp, ports] as const;
}

// export function CreateComponentN(pos: Vector, kind: keyof typeof AllComponentInfo, N: number) {
//     return Array(N).fill(0).map((_, i) => {
//         const [comp, ports] = CreateComponent(kind);

//         comp.y =
//     });
// }

// export function PlaceComponent(
//     circuit: CircuitController<AnyObj>,
//     kind: keyof typeof AllComponentInfo,
//     compID = uuid(),
// ): Action {

//     // Return action
//     return new GroupAction([
//         Place(circuit, comp),
//         ...ports.map((p) => Place(circuit, p)),
//     ]);
// }
