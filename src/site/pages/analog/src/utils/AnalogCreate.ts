import {AnalogCircuitController} from "analog/controllers/AnalogCircuitController";
import {AnalogComponentInfo}     from "core/views/info/analog";

import {Vector} from "Vector";

import {uuid} from "core/utils/GUID";

import {AnalogComponent} from "core/models/types/analog";


/**
 * Utility function that creates a DigitalComponent from the given itemId
 *  This does more then simply using the `Create` function since it also takes into
 *  account ICs.
 *
 * @param itemKind The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param _circuit The circuit designer for the items. Needed for access to ICs. Currently unused.
 * @returns          The DigitalComponent associated with the given ID.
 * @throws If the itemId is an invalid item or IC.
 */
export function AnalogCreate(itemKind: AnalogComponent["kind"], _circuit: AnalogCircuitController): AnalogComponent {
    const component = AnalogComponentInfo[itemKind].Default(uuid());
    if (!component)
        throw new Error(`Failed to create digital item w/ kind: ${itemKind}`);
    return component;
}


/**
 * Utility function that creates `N` DigitalComponents from the given `itemId`. It also
 *  will position them vertically starting at the given `pos` vector.
 *
 * @param pos      The position of the first component.
 * @param itemKind The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param circuit  The cirucit designer for the items. Needed for access to ICs.
 * @param N        The number of items to create.
 * @returns          The list of DigitalComponents associated with the given ID and of length `N`.
 * @throws If the itemId is an invalid item or IC.
 */
export function AnalogCreateN(pos: Vector, itemKind: string, circuit: AnalogCircuitController,
                              N: number): AnalogComponent[] {
    // for (let i = 0; i < N; i++) {
    //     const comp = AnalogCreate(itemId, designer);

    //     comp.setPos(pos);

    //     comps.push(comp);

    //     // Place the components vertically
    //     pos = pos.add(0, comp.getCullBox().getSize().y);
    // }

    return [] as AnalogComponent[];
}
