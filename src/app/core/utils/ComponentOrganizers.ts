import {ORGANIZE_SEP_X, ORGANIZE_SEP_Y} from "./Constants";

import {Vector} from "Vector";

import {CreateGraph, IOObjectSet} from "./ComponentUtils";


function OrganizeCore(groups: IOObjectSet, start: Vector, depths: number[][]): void {
    // Depths is a 2d array where the index of the inner array indicates the depth of all of the nodes inside that array
    const components = groups.getComponents();

    depths.forEach((nodes, depth) =>
        nodes.forEach((node, index) => 
            components[node].setPos(start.add(ORGANIZE_SEP_X*depth - depths.length/2, 
                                              ORGANIZE_SEP_Y*index - nodes.length/2))
        )
    );
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMaxNodeDepths function of Graph to accomplish this
 *
 * @param  groups The components to organize
 * @param  start  The top left coordinate where the organization should start
 */
export function OrganizeMaxDepth(groups: IOObjectSet, start: Vector): void {
    OrganizeCore(groups, start, CreateGraph(groups).getMaxNodeDepths());
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMinNodeDepths function of Graph to accomplish this
 *
 * @param  groups The components to organize
 * @param  start  The top left coordinate where the organization should start
 */
export function OrganizeMinDepth(groups: IOObjectSet, start: Vector): void {
    OrganizeCore(groups, start, CreateGraph(groups).getMinNodeDepths());
}
