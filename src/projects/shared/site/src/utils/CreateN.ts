import {Vector} from "Vector";

import {CircuitInfo} from "core/utils/CircuitInfo";

import {GroupAction} from "core/actions/GroupAction";

import {PlaceGroup} from "core/actions/units/Place";

import {AnyComponent} from "core/models/types";

import {CreateComponent} from "core/models/utils/CreateComponent";


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
