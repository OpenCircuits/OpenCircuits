import {Vector} from "Vector";

import {Camera} from "core/schema/Camera";

import {Prim} from "../Prim";


/**
 * A representation of an Circular Sector shape.
 *
 * A Circular Sector is a sector of a circle through two given angles.
 *
 * i.e. Drawing a half-circle or quarter-circle.
 *
 * See: https://en.wikipedia.org/wiki/Circular_sector.
 */
export class CircleSectorPrim implements Prim {
    public readonly kind = "CircleSector";

    public pos: Vector;
    public radius: number;
    public angles: [number, number];

    /**
     * Constructor for a circular sector primitive.
     *
     * @param pos    The position of the center of the sector.
     * @param radius The radius of the sector.
     * @param angles The starting and ending angles of the sector.
     */
    public constructor(pos: Vector, radius: number, angles: [number, number] = [0, 2*Math.PI]) {
        this.pos = pos;
        this.radius = radius;
        this.angles = [...angles];
    }

    public hitTest(pt: Vector): boolean {
        throw new Error("Method not implemented.");
    }

    public cull(camera: Camera): boolean {
        throw new Error("Method not implemented.");
    }
}
