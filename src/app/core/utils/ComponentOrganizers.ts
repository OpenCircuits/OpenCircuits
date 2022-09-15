import {Vector} from "Vector";

import {CreateGraph, IOObjectSet} from "./ComponentUtils";


const ORGANIZE_SEP_X = 4;
const ORGANIZE_SEP_Y = 3;

function OrganizeCore(groups: IOObjectSet, start: Vector, depths: number[][]): void {
    // Depths is a 2d array where the index of the inner array indicates the depth of all of the nodes inside that array
    const components = groups.getComponents();

    depths.forEach((nodes, depth) =>
        nodes.forEach((node, index) =>
                                                                                            // extra space for labels
            components[node].setPos(start.add(ORGANIZE_SEP_X*(depth - (depths.length - 1)/2) + ORGANIZE_SEP_X/2,
                                             -ORGANIZE_SEP_Y*(index - (nodes.length  - 1)/2)))
        )
    );
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMaxNodeDepths function of Graph to accomplish this.
 *
 * @param groups The components to organize.
 * @param start  The top left coordinate where the organization should start.
 */
export function OrganizeMaxDepth(groups: IOObjectSet, start: Vector): void {
    OrganizeCore(groups, start, CreateGraph(groups).getMaxNodeDepths());
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMinNodeDepths function of Graph to accomplish this.
 *
 * @param groups The components to organize.
 * @param start  The top left coordinate where the organization should start.
 */
export function OrganizeMinDepth(groups: IOObjectSet, start: Vector): void {
    OrganizeCore(groups, start, CreateGraph(groups).getMinNodeDepths());
}
