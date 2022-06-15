import {serializable} from "serialeazy";

import {IO_PORT_LENGTH, DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Port} from "core/models/ports/Port";

export type Dir = "left" | "right" | "top" | "bottom";


/**
 * places the ports depending on the type of Positioner
 * each component assigns its own Positioner
 */
@serializable("Positioner")
export class Positioner<T extends Port> {
    /**
    * maps directions to their corresponding vectors  
    */
    public static readonly DIRS: Record<Dir, Vector> = {
        "left":   V(-1, 0),
        "right":  V(1,  0),
        "top":    V(0, -1),
        "bottom": V(0,  1),
    };

    /**
    * direction of the ports relative to the parent component 
    */
    private dir: Vector;
    /**
    * factor to increase the spacing of the ports by 
    */
    private scale: number;
    /**
    * length of the ports 
    */
    private length: number;
    /**
     * if true the first port and last port will be moved innerward 
     * by one space in the spacing calculation 
     */
    private shortenEdges: boolean;

    /**
     * Intializes a Positioner with the following parameters
     * @param dir direction of the ports relative to the parent component
     * @param scale factor to increase the spacing of the ports by (defaults to 1)
     * @param length length of the ports (defaults to IO_PORT_LENGTH )
     * @param shortenEdges if true the first port and last port will be moved innerward 
     * by one space in the spacing calculation (defaults to true)
     */
    public constructor(dir?: Dir, scale: number = 1, length: number = IO_PORT_LENGTH, shortenEdges: boolean = true) {
        this.dir = (dir) ? (Positioner.DIRS[dir]) : (V());
        this.scale = scale;
        this.length = length;
        this.shortenEdges = shortenEdges;
    }

    /**
     * Calculates the amount of space between ports
     * @param i index of port
     * @param numPorts the number of ports
     * @param size factor to increase the spacing between ports (the spacing is multiplied by size/2)
     * @returns value representing the spacing between ports
     */
    protected calcSpacingPos(i: number, numPorts: number, size: number): number {
        const midpoint = (numPorts - 1) / 2;

        // Shift index over by the midpoint, which maps the indices to be centered around the origin
        //  then multiply by a scale (size) to expand it about the origin
        // AKA: mapping i = [0, N-1] to [-(N-1)/2, (N-1)/2]
        let l = this.scale * size/2 * (i - midpoint);

        if (this.shortenEdges && i === 0) l++;
        if (this.shortenEdges && i == numPorts-1) l--;

        return l;
    }
    /**
     * Calculates the position of where the port attaches to the parent component relative to the parent component
     * @param sX  position of the port on X axis
     * @param sY position of the port on Y axis
     * @param w width of the port
     * @param h height of the port
     * @returns a vector representing the position where the port attaches to the parent component
     */
    protected calcOriginPos(sX: number, sY: number, w: number, h: number): Vector {
        const dir = this.dir;

        return V(Math.abs(dir.y) * sX + dir.x * (w/2 - DEFAULT_BORDER_WIDTH),
                 Math.abs(dir.x) * sY + dir.y * (h/2 - DEFAULT_BORDER_WIDTH));
    }

    /**
     * Calculates the position of where the port is on the canvas relative to the parent component
     * @param sX  position of the port on X axis
     * @param sY position of the port on Y axis
     * @param w width of the port
     * @param h height of the port
     * @returns a vector representing the position of the port relative to the parent component 
     */
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
