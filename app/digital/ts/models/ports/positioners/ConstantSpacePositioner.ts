import {V} from "Vector";

import {Port} from "../Port";

import {Positioner} from "./Positioner";

export class ConstantSpacePositioner<T extends Port> extends Positioner<T> {
    private spacing: number;

    public constructor(spacing: number) {
        super();
        this.spacing = spacing;
    }

    /**
     * Port positiong for constant spacing that doesn't
     *  depend on the parent's size
     *
     * @param arr The array of input ports
     */
    public updatePortPositions(ports: Array<T>): void {
        ports.forEach((port, i) => {
            // Calculate y position of port
            let l = -this.spacing*(i - ports.length/2 + 0.5);
            if (i === 0) l--;
            if (i === ports.length-1) l++;

            // Set y positions
            port.setOriginPos(V(port.getOriginPos().x, l));
            port.setTargetPos(V(port.getTargetPos().x, l));
        });
    }

}
