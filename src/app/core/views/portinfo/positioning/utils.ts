import {IO_PORT_LENGTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {linspace} from "math/MathUtils";

import {PortPos} from "../types";


export const CalcPortPos = (origin: Vector, dir: Vector) =>  ({
    origin,
    target: origin.add(dir.scale(IO_PORT_LENGTH)),
    dir,
});

export const CalcPortPositions = (amt: number, spacing: number, width: number, dir: Vector) => (
    linspace((amt-1)/2*spacing, -(amt-1)/2*spacing, amt)
        .map((h) => CalcPortPos(V(dir.x*width/2, h), dir))
);

export type Positioner = (amt: number) => Record<number, PortPos[]>;


/**
 * Utility function to help generate port configurations for components with multiple configurations.
 *
 * The function takes in an array of `basisAmts` which represents
 *  the set of the number of possible ports for the "basis" of this component.
 *
 * The "basis" is the group of ports that the rest of the groups as based off of.
 * i.e. For an ANDGate this would "input ports", for an Encoder this would be "output ports".
 *
 * So for an ANDGate, `basisAmts = [2,3,4,5,6,7,8]` since those are the possible number of input ports
 *  that an ANDGate can have.
 *
 * The second parameter is a `Positioner` which is a function that takes in a certain basis amount
 *  and returns the positions of all of the ports for that given amount mapped to its associated group.
 *
 * So for `amt = 2`, the positioner should return a Record with its basis group having `2` positions
 *  and any other group having however many positions that are needed.
 *
 * So for an ANDGate with `amt = 2`, this should return 2 positions for the inputs and 1 for the output.
 * For an Encoder with `amt = 2`, this would return 4 positions for the inputs and 2 for the outputs.
 * Represented as: {
 *   0: [... my input positions ...],  // `0: ` meaning group 0
 *   1: [... my output positions ...], // `1: ` meaning group 1
 * }.
 *
 * @param basisAmts  An array of possible port counts for the basis group of this component.
 * @param positioner A positioner that should return the positions for each port at each basis amount.
 * @returns            A full port positioning config.
 */
export const GenPortConfig = (
    basisAmts: number[],
    positioner: Positioner,
) => (
    Object.fromEntries(
        new Array(basisAmts.length).fill(0)
            .map((_, i) => {
                const positions = positioner(basisAmts[i]);
                const groups = Object.keys(positions).map((v) => parseInt(v)).sort();

                // Generate config ID
                const configID = (() => {
                    const g = new Array(Math.max(...groups)+1).fill(0);
                    groups.forEach((v) => (g[v] = positions[v].length));
                    return g.join(",");
                })();

                return [
                    configID,
                    Object.fromEntries(
                        // Go through each group
                        groups.flatMap((group) => (
                            // And insert the position at each index
                            positions[group].map((p, index) => [`${group}:${index}`, p] as const)
                        ))
                    ),
                ];
            })
    )
);
