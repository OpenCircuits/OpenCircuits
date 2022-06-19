import {Create} from "serialeazy";

import {Vector} from "Vector";

import {AnalogCircuitDesigner, AnalogComponent} from "analog/models";


/**
 * Utility function that creates a DigitalComponent from the given itemId
 *  This does more then simply using the `Create` function since it also takes into
 *  account ICs.
 *
 * @param itemId    The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *            corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param _designer The circuit designer for the items. Needed for access to ICs. Currently unused.
 * @returns           The DigitalComponent associated with the given ID.
 * @throws If the itemId is an invalid item or IC.
 */
export function AnalogCreate(itemId: string, _designer: AnalogCircuitDesigner): AnalogComponent {
    const component = Create<AnalogComponent>(itemId);
    if (!component)
        throw new Error(`Failed to create digital item w/ id: ${itemId}`);
    return component;
}


/**
 * Utility function that creates `N` DigitalComponents from the given `itemId`. It also
 *  will position them vertically starting at the given `pos` vector.
 *
 * @param pos      The position of the first component.
 * @param itemId   The ID of the item, if an IC then it has the form: `ic/INDEX`, where INDEX
 *           corresponds to the index of the IC relative to the list of ICs in `designer`.
 * @param designer The cirucit designer for the items. Needed for access to ICs.
 * @param N        The number of items to create.
 * @returns          The list of DigitalComponents associated with the given ID and of length `N`.
 * @throws If the itemId is an invalid item or IC.
 */
export function AnalogCreateN(pos: Vector, itemId: string, designer: AnalogCircuitDesigner,
                              N: number): AnalogComponent[] {
    const comps = [] as AnalogComponent[];

    for (let i = 0; i < N; i++) {
        const comp = AnalogCreate(itemId, designer);

        comp.setPos(pos);

        comps.push(comp);

        // Place the components vertically
        pos = pos.add(0, comp.getCullBox().getSize().y);
    }

    return comps;
}
