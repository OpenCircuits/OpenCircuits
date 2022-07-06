import {Vector} from "Vector";

/**
 * A simple axis-aligned bounding box.
 * A representation of a 2D Bounding Box. Used to keep track of area used by component(s).
 */
export class BoundingBox {
    private min: Vector;
    private max: Vector;

    /**
     * Creates a Bounding Box with the given coordinates.
     *
     * @param min The corrdinates of bottom left corner of Bounding Box.
     * @param max The coordinates of top right corner of Bounding Box.
     */
    public constructor(min: Vector, max: Vector) {
        this.min = min.copy();
        this.max = max.copy();
    }

    /**
     * Returns the (x,y) value of bottom left corner of Bounding Box.
     *
     * @returns Coordinates of bottom left corner of Bounding Box.
     */
    public getMin(): Vector {
        return this.min.copy();
    }

    /**
     * Returns the (x,y) value of top right corner of Bounding Box.
     *
     * @returns Coordinates of top right corner of Bounding Box.
     */
    public getMax(): Vector {
        return this.max.copy();
    }

    /**
     * Sets new coordinates for bottom left corner of Bounding Box.
     *
     * @param min Coordinates of new bottom left corner of Bounding Box.
     */
    public setMin(min: Vector): void {
        this.min.x = min.x;
        this.min.y = min.y;
    }

    /**
     * Sets new corrdinates for top right corner of Bounding Box.
     *
     * @param max Coordinates of new top right corner of Bounding Box.
     */
    public setMax(max: Vector): void {
        this.max.x = max.x;
        this.max.y = max.y;
    }

    /**
     * Calculates coordinate length of the width of Bounding Box.
     *
     * @returns Coordinate length of the width of Bounding Box.
     */
    public getWidth(): number {
        return this.max.x - this.min.x;
    }

    /**
     * Calculates coordinate length of the height of Bounding Box.
     *
     * @returns Coordinate length of the height of Bounding Box.
     */
    public getHeight(): number {
        return this.max.y - this.min.y;
    }

    /**
     * Calculates coordinate area of Bounding Box.
     *
     * @returns Coordinate area of Bounding Box.
     */
    public getArea(): number {
        return this.getWidth() * this.getHeight();
    }

    /**
     * Calculates the coordinates of the center of Bounding Box.
     *
     * @returns Coordinates of the center of Bounding Box.
     */
    public getCenter(): Vector {
        return this.getMin().add(this.getMax()).scale(0.5);
    }
}
