import {Vector} from "Vector";

import {CircuitInfo} from "shared/api/circuit/utils/CircuitInfo";

import {GroupAction} from "shared/api/circuit/actions/GroupAction";

import {PlaceGroup} from "shared/api/circuit/actions/units/Place";

import {AnyComponent} from "shared/api/circuit/models/types";

import {CreateComponent} from "shared/api/circuit/models/utils/CreateComponent";


export function Create(itemKind: AnyComponent["kind"], pos: Vector, zIndex: number) {
    const [component, ...ports] = CreateComponent(itemKind, zIndex);
    component.x = pos.x;
    component.y = pos.y;
    return [component, ...ports];
}

export function CreateNComponents(
    info: CircuitInfo,
    itemKind: AnyComponent["kind"],
    N: number,
    pos: Vector,
    zIndex: number
) {
    return new GroupAction(
        new Array(N).fill(0).map((_) => {
            // Create and place the component + ports
            const [comp, ...ports] = Create(itemKind, pos, zIndex);
            const action = PlaceGroup(info.circuit, [comp, ...ports]);

            // Calculate bounds of the placed group to offset the position for the next group
            const bounds = info.viewManager.calcBoundsOf([comp, ...ports]);
            pos = pos.sub(0, bounds.height);

            return action;
        }),
        "Create Components",
    );
}
