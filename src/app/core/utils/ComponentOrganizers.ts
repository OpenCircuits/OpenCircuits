import {Vector} from "Vector";
import {Graph} from "math/Graph";

import {CreateGraph, IOObjectSet} from "./ComponentUtils";

import {Component} from "core/models/Component";

function OrganizeCore(groups: IOObjectSet, start: Vector, depthMap: Map<number, number>): void {
    const depthArray: Component[][] = [];
    const components = groups.getComponents();

    // Convert the map to a 2d array where index of first array is the depth
    for (const [index, depth] of depthMap.entries()) {
        while (depthArray.length <= depth)
            depthArray.push([]);
        depthArray[depth].push(components[index]);
    }

    const xOffset: number = 250;
    const yOffset: number = 150;

    for (let i = 0; i < depthArray.length; i++) {
        for (let j = 0; j < depthArray[i].length; j++) {
            const component = depthArray[i][j];
            const newLocation = new Vector(start.x + xOffset * i, start.y + yOffset * j);
            component.setPos(newLocation);
        }
    }
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMaxNodeDepths function of Graph to accomplish this
 *
 * @param  groups The components to organize
 * @param  start  The top left coordinate where the organization should start
 */
export function OrganizeMaxDepth(groups: IOObjectSet, start: Vector): void {
    const graph = CreateGraph(groups);
    const depthMap = graph.getMaxNodeDepths();
    OrganizeCore(groups, start, depthMap);
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMinNodeDepths function of Graph to accomplish this
 *
 * @param  groups The components to organize
 * @param  start  The top left coordinate where the organization should start
 */
export function OrganizeMinDepth(groups: IOObjectSet, start: Vector): void {
    const graph = CreateGraph(groups);
    const depthMap = graph.getMinNodeDepths();
    OrganizeCore(groups, start, depthMap);
}