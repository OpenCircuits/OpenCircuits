import {V, Vector} from "Vector";
import {Rect} from "./Rect";


/**
 * Represents a generic parametric curve.
 * Given t : [0, 1], can return the point (x, y) or 1st/2nd derivatives at that point.
 */
export abstract class Curve {
    /**
     * Bounding box accessor updates the bounding box and returns it.
     *
     * @returns A Transform that contains the bounding box of the curve.
     */
    public abstract get bounds(): Rect;

    /**
     * Calculates x coordinate of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The x coordinate of t.
     */
    public abstract getX(t: number): number;

    /**
     * Calculates y coordinate of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The y coordinate of t.
     */
    public abstract getY(t: number): number;

    /**
     * Calculates x and y coordinates of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The x and y coordinates of t.
     */
    public getPos(t: number): Vector {
        return V(this.getX(t), this.getY(t));
    }

    /**
     * Calculates the 1st derivative of x coord of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 1st derivative of x coord of t.
     */
    public abstract getDX(t: number): number;

    /**
     * Calculates the 1st derivative of y coord of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 1st derivative of y coord of t.
     */
    public abstract getDY(t: number): number;

    /**
     * Calculates the 1st derivatives of x and y coordinates of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 1st derivatives of x and y coordinates of t.
     */
    public getDerivative(t: number): Vector {
        return V(this.getDX(t), this.getDY(t));
    }

    /**
     * Calculates the 2nd derivative of x coordinate of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 2nd derivative of x coordinate of t.
     */
    public abstract getDDX(t: number): number;

    /**
     * Calculates the 2nd derivative of y coordinate of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 2nd derivative of y coordinate of t.
     */
    public abstract getDDY(t: number): number;

    /**
     * Calculates the 2nd derivatives of x and y coordinates of t.
     *
     * @param t How far along the curve the given point is.
     * @returns The 2nd derivative of x and y coordinates of t.
     */
    public get2ndDerivative(t: number): Vector {
        return V(this.getDDX(t), this.getDDY(t));
    }
}
