import {v4 as uuid} from "uuid";

import {AllComponentInfo} from "core/views/info";
import {AllPortInfo}      from "core/views/portinfo";

import {AnyComponent, AnyPort} from "../types";


export function CreateComponent(kind: keyof typeof AllComponentInfo, zIndex: number, compID = uuid()) {
    const info = AllComponentInfo[kind];
    const portInfo = AllPortInfo[kind];

    // Create component
    const comp = info.Default(compID);

    // Create ports
    const portConfig = portInfo.Positions[AllPortInfo[kind].InitialConfig];
    const ports = Object.keys(portConfig).map((s) => {
        const [group, index] = s.split(":").map((s) => parseInt(s));
        return portInfo.Default(uuid(), compID, group, index);
    });

    // Set z-index
    [comp, ...ports].forEach((o) => (o.zIndex = zIndex));

    return [comp, ...ports] as [AnyComponent, ...AnyPort[]];
}

// @TODO
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
