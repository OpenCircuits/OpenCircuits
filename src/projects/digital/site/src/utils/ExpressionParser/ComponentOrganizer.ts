// TODO[model_refactor_api](trevor): Get this working for expression to circuit frontend
import {Vector} from "Vector";
import {Circuit} from "shared/api/circuit/public";

import {CreateGraph} from "shared/api/circuit/utils/CircuitUtils";


const ORGANIZE_SEP_X = 4;
const ORGANIZE_SEP_Y = 3;

function OrganizeCore(circuit: Circuit, start: Vector, depths: string[][]): void {
    // Depths is a 2d array where the index of the inner array indicates the depth of all of the nodes inside that array
    depths.forEach((nodes, depth) =>
        nodes.forEach((id, index) =>
            circuit.getComponent(id)!.pos = (                              // VVV extra space for labels
                start.add(ORGANIZE_SEP_X * (depth - (depths.length - 1) / 2) + ORGANIZE_SEP_X / 2,
                    -ORGANIZE_SEP_Y * (index - (nodes.length - 1) / 2))
            )
        )
    );
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMaxNodeDepths function of Graph to accomplish this.
 *
 * @param circuit The circuit to organize.
 * @param start   The top left coordinate where the organization should start.
 */
export function OrganizeMaxDepth(circuit: Circuit, start: Vector): void {
    OrganizeCore(circuit, start, CreateGraph(circuit).getMaxNodeDepths());
}

/**
 * Organizes the components so that components at greater depth are further to the right,
 * using the getMinNodeDepths function of Graph to accomplish this.
 *
 * @param circuit The circuit to organize.
 * @param start   The top left coordinate where the organization should start.
 */
export function OrganizeMinDepth(circuit: Circuit, start: Vector): void {
    OrganizeCore(circuit, start, CreateGraph(circuit).getMinNodeDepths());
}
