import {serializable, serialize} from "serialeazy";

import {Vector,V} from "./Vector";
import {Transform} from "./Transform";
import {Matrix2x3} from "./Matrix";
import {TransformContains} from "./MathUtils";



/**
 * This code is for the camera object which is a representation of the screen while using OpenCircuits.
 */

@serializable("Camera")
export class Camera {
    @serialize
    private pos: Vector;
    @serialize
    private zoom: number;

    private transform: Transform;

    private mat: Matrix2x3;
    private inv: Matrix2x3;

    @serialize
    private width: number;
    @serialize
    private height: number;

    private dirty: boolean;

    /**
     * This constructor creates new Camera object which is the field of view (the screen) and initializes all the variables.
     * It sets dirty to true which means that 
     * @param width The width of the camera (screen)
     * @param height The height of the camera (screen)
     * @param startPos The starting position in the camera to 0,0 (vector)
     * @param startZoom This initialzed zoom to 1
     */
    public constructor(width?: number, height?: number, startPos: Vector = V(0, 0), startZoom: number = 1) {
        this.width = width!;
        this.height = height!;
        this.pos = startPos;
        this.zoom = startZoom;
        this.transform = new Transform(V(0,0), V(0,0), 0);
        this.dirty = true;
    }

    /**
     * If dirty is true then it updates and recalculates the matrix to the new position, height, and width. 
     * dirty represents whether the screen has been changed/moved or not.
     */
    private updateMatrix(): void {
        if (!this.dirty)
            return;

        this.dirty = false;

        this.mat = new Matrix2x3();
        this.mat.translate(this.pos);
        this.mat.scale(V(this.zoom, this.zoom));
        this.inv = this.mat.inverse();

        const p1 = this.getWorldPos(V(0, 0));
        const p2 = this.getWorldPos(V(this.width, this.height));
        this.transform.setPos(p2.add(p1).scale(0.5));
        this.transform.setSize(p2.sub(p1));
    }

    /**
     * This function resizes the height and width and sets dirty to true when the screen is moved.
     * @param width new width of screen
     * @param height new height of screen
     */
    public resize(width: number, height: number): void {
        this.dirty = true;
        this.width = width;
        this.height = height;
    }

    /**
     * This sets the position of the screen (vector coordinates) and sets dirty to true.
     * @param pos  the new position vector
     */
    public setPos(pos: Vector): void {
        this.dirty = true;
        this.pos = pos;
    }

    /**
     * The sets the zoom variable to the new zoom number
     * @param zoom  the new zoom number (how much it's being zoomed in).
     */
    public setZoom(zoom: number): void{
        this.dirty = true;
        this.zoom = zoom;
    }

    /**
     * This moves the position of the screen by dv (Ex: pos=(10,10) dv=(5,0) then pos will = (15,10) after call)
     * @param dv is a vector that represents by how much the position will be moved
     */
    public translate(dv: Vector): void {
        this.dirty = true;
        this.pos = this.pos.add(dv);
    }

    /**
     * Zooms to a certain position on the screen by a certain amount z.
     * @param c is the position it's zooming to
     * @param z the amount it is zooming 
     */
    public zoomTo(c: Vector, z: number): void {
        // Calculate position to zoom in/out of
        const pos0 = this.getWorldPos(c);
        this.zoomBy(z);
        const pos1 = this.getScreenPos(pos0);
        const dPos = pos1.sub(c);
        this.translate(dPos.scale(this.getZoom()));
    }

    /**
     * zooms in or out at the current position 
     * @param s amount to zoom by
     */
    public zoomBy(s: number): void {
        this.dirty = true;
        this.zoom *= s;
    }
    /**
     * This function returns true or false if this.transform contains the transform passed through
     * @param transform comparing this with this.transform
     * @returns true or false
     */
    public cull(transform: Transform): boolean {
        return TransformContains(transform, this.getTransform());
    }
    /**
     * This returns the coordinates of the center of the screen wherever it is.
     * @returns return vector with coordinates
     */
    public getCenter(): Vector {
        return V(this.width/2, this.height/2);
    }
    /**
     * makes a copy of pos to return
     * @returns the position
     */
    public getPos(): Vector {
        return this.pos.copy();
    }
    /**
     * return how much the screen is zoomed in/out by.
     * @returns the zoom, which is data type Number
     */
    public getZoom(): number {
        return this.zoom;
    }
    /**
     * This returns a copy of the transform of camera and updates the matrix 
     * @returns copy of this.transform
     */
    public getTransform(): Transform {
        this.updateMatrix();
        return this.transform.copy();
    }
    /**
     * Returns copy of current matrix and updates the matrix as needed.
     * @returns returns copy of mat.
     */
    public getMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.mat.copy();
    }
    /**
     * Returns a copy of the inverse of the matrix and updates the matrix
     * @returns return copy of inv
     */
    public getInverseMatrix(): Matrix2x3 {
        this.updateMatrix();
        return this.inv.copy();
    }
    /**
     * returns the current screen position with formula using the vector v and getCenter 
     * @param v  is the vector multiplied to inv
     * @returns a vector of the screen position
     */
    public getScreenPos(v: Vector): Vector {
        return this.getInverseMatrix().mul(v).add(this.getCenter());
    }
    /**
     * Returns the global position not the local screens position
     * @returns global position
     */
    public getWorldPos(v: Vector): Vector {
        return this.getMatrix().mul(v.sub(this.getCenter()));
    }

}
