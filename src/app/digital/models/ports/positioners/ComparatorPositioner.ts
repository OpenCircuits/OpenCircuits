import {serializable} from "serialeazy";

import {ConstantSpacePositioner} from "core/models/ports/positioners/ConstantSpacePositioner";

import {InputPort} from "digital/models";


@serializable("ComparatorPositioner")
export class ComparatorPositioner extends ConstantSpacePositioner<InputPort> {

    /**
     * Position ports with constant space but put blank space in the middle.
     *
     * @param ports The array of input ports.
     */
    public override updatePortPositions(ports: InputPort[]): void {
        super.updatePortPositions([
            ...ports.slice(0, ports.length/2),
            undefined,
            ...ports.slice(ports.length/2),
        ]);
    }

}
