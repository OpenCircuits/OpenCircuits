import {serializable} from "serialeazy";

import {IO_PORT_LENGTH, DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Port} from "core/models/ports/Port";

export type Dir = "left" | "right" | "top" | "bottom";

@serializable("Positioner")
export class Positioner<T extends Port> {
    public static readonly DIRS = new Map<string, Vector>([
        ["left",   V(-1, 0)],
        ["right",  V(1,  0)],
        ["top",    V(0, -1)],
        ["bottom", V(0,  1)]
    ]);

    private dir: Vector;
    private length: number;

    public constructor(dir?: Dir, length: number = IO_PORT_LENGTH) {
        this.dir = Positioner.DIRS.get(dir) || V();
        this.length = length;
    }

    protected calcSpacingPos(i: number, numPorts: number, size: number, shortenEdges: boolean = true): number {
        let l = size/2 * (i - numPorts/2 + 0.5);
        if (shortenEdges && i === 0) l++;
        if (shortenEdges && i == numPorts-1) l--;
        return l;
    }

    protected calcOriginPos(sX: number, sY: number, w: number, h: number): Vector {
        const dir = this.dir;

        return V(Math.abs(dir.y) * sX + dir.x * (w/2 - DEFAULT_BORDER_WIDTH),
                 Math.abs(dir.x) * sY + dir.y * (h/2 - DEFAULT_BORDER_WIDTH));
    }

    protected calcTargetPos(sX: number, sY: number, w: number, h: number): Vector {
        const dir = this.dir;

        return V(Math.abs(dir.y) * sX + dir.x * (this.length + w/2),
                 Math.abs(dir.x) * sY + dir.y * (this.length + h/2));
    }

    /**
     * Default behavior for port positioning to
     *  be evenly spaced along the left side
     *  of this component.
     * @param arr The array of ports (either in or out ports)
     */
    public updatePortPositions(ports: Array<T>): void {
        ports.forEach((port, i) => {
            const width = port.getParent().getSize().x;
            const height = port.getParent().getSize().y;

            const sY = this.calcSpacingPos(i, ports.length, height);
            const sX = this.calcSpacingPos(i, ports.length, width);

            const p0 = this.calcOriginPos(sX, sY, width, height);
            const p1 = this.calcTargetPos(sX, sY, width, height);

            port.setOriginPos(p0);
            port.setTargetPos(p1);
        });
    }

}
