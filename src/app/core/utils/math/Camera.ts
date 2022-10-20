import {DirtyVar} from "../DirtyVar";

import {TransformContains} from "./MathUtils";
import {Matrix2x3}         from "./Matrix";
import {Transform}         from "./Transform";
import {V, Vector}         from "./Vector";


type Margin = {left: number, right: number, bottom: number, top: number}

/**
 * This code is for the camera object which is a representation of the screen while using OpenCircuits.
 */
export class Camera {
    private pos: Vector;
    private zoom: number;

    private width: number;
    private height: number;

    private readonly transform: DirtyVar<Transform>;

    private readonly mats: DirtyVar<[Matrix2x3, Matrix2x3]>;

    private margin: Margin;

    /**
     * This constructor creates new Camera object which is the field of view (the screen)
     * and initializes all the variables.
     * It sets dirty to true which means that.
     *
     * @param width  The width of the camera (screen).
     * @param height The height of the camera (screen).
     * @param pos    The starting position in the camera to 0,0 (vector).
     * @param zoom   This initialzed zoom to 1.
     */
    public constructor(width = 0, height = 0, pos = V(0, 0), zoom = 0.02) {
        this.pos = pos;
        this.zoom = zoom;
        this.width = width;
        this.height = height;

        this.transform = new DirtyVar(() => {
            const p1 = this.getWorldPos(V(0, 0));
            const p2 = this.getWorldPos(V(this.width, this.height));
            return Transform.FromCorners(p1, p2);
        });

        this.margin = { left: 0, right: 0, bottom: 0, top: 0 };
        this.mats = new DirtyVar(() => {
            const mat = new Matrix2x3();
            mat.translate(this.getPos());
            mat.scale(this.getScale());

            return [mat, mat.inverse()];
        })
    }

    /**
     * This function resizes the height and width and sets dirty to true when the screen is moved.
     *
     * @param width  The new width of screen.
     * @param height The new height of screen.
     */
    public resize(width: number, height: number): void {
        this.mats.setDirty();
        this.transform.setDirty();
        this.width = width;
        this.height = height;
    }

    /**
     * This sets the position of the screen (vector coordinates) and sets dirty to true.
     *
     * @param pos The new position vector.
     */
    public setPos(pos: Vector): void {
        this.pos = pos;
        this.mats.setDirty();
        this.transform.setDirty();
    }

    /**
     * The sets the zoom variable to the new zoom number.
     *
     * @param zoom The new zoom number (how much it's being zoomed in).
     */
    public setZoom(zoom: number): void {
        this.zoom = zoom;
        this.mats.setDirty();
        this.transform.setDirty();
    }

    /**
     * This moves the position of the screen by dv (Ex: pos=(10,10) dv=(5,0) then pos will = (15,10) after call).
     *
     * @param dv A vector that represents by how much the position will be moved.
     */
    public translate(dv: Vector): void {
        this.mats.setDirty();
        this.transform.setDirty();
        this.setPos(this.getPos().add(dv));
    }

    /**
     * Zooms to a certain position on the screen by a certain amount z.
     *
     * @param c The position it's zooming to.
     * @param z The amount it is zooming.
     */
    public zoomTo(c: Vector, z: number): void {
        // Calculate position to zoom in/out of
        const pos0 = this.getWorldPos(c);
        this.zoomBy(z);
        const pos1 = this.getScreenPos(pos0);
        const dPos = pos1.sub(c);
        this.translate(dPos.scale(this.getScale()));
    }

    /**
     * Zooms in or out at the current position.
     *
     * @param s The amount to zoom by.
     */
    public zoomBy(s: number): void {
        this.mats.setDirty();
        this.transform.setDirty();
        this.setZoom(this.getZoom() * s);
    }
    /**
     * This function returns true or false if this.transform contains the transform passed through.
     *
     * @param transform Comparing this with this.transform.
     * @returns         True or false.
     */
    public cull(transform: Transform): boolean {
        return TransformContains(transform, this.getTransform());
    }
    /**
     * This returns the coordinates of the center of the screen wherever it is.
     *
     * @returns Return vector with coordinates.
     */
    public getCenter(): Vector {
        return V(this.width/2, this.height/2);
    }
    /**
     * Returns the size of the screen. This is the bottom-right corner.
     *
     * @returns Vector that contains the size of the screen.
     */
    public getSize(): Vector {
        return V(this.width, this.height);
    }
    /**
     * Makes a copy of pos to return.
     *
     * @returns The position.
     */
    public getPos(): Vector {
        return V(this.pos as Vector);
    }
    public getScale(): Vector {
        return V(this.getZoom(), -this.getZoom());
    }
    /**
     * Return how much the screen is zoomed in/out by.
     *
     * @returns The zoom, which is data type Number.
     */
    public getZoom(): number {
        return this.zoom as number;
    }
    /**
     * This returns a copy of the transform of camera and updates the matrix.
     *
     * @returns Copy of this.transform.
     */
    public getTransform(): Transform {
        return this.transform.get();
    }
    /**
     * Returns copy of current matrix and updates the matrix as needed.
     *
     * @returns Returns copy of mat.
     */
    public getMatrix(): Matrix2x3 {
        return this.mats.get()[0];
    }
    /**
     * Returns a copy of the inverse of the matrix and updates the matrix.
     *
     * @returns Returned copy of inv.
     */
    public getInverseMatrix(): Matrix2x3 {
        return this.mats.get()[1];
    }
    /**
     * Returns the current screen position with formula using the vector v and getCenter.
     *
     * @param v The vector multiplied to inv.
     * @returns A vector of the screen position.
     */
    public getScreenPos(v: Vector): Vector {
        return this.getInverseMatrix().mul(v).add(this.getCenter());
    }
    /**
     * Returns the global position not the local screens position.
     *
     * @param v The current position.
     * @returns The global position.
     */
    public getWorldPos(v: Vector): Vector {
        return this.getMatrix().mul(v.sub(this.getCenter()));
    }

    /**
     * Returns a set of margins that adjusts the view of the camera.
     *
     * @returns Margin values for the camera.
     */
    public getMargin(): Margin {
        return this.margin;
    }

    /**
     * This sets the margin for the camera.
     *
     * @param newMargin        The new margins for the camera.
     * @param newMargin.left   The left margin of the camera.
     * @param newMargin.right  The right margin of the camera.
     * @param newMargin.bottom The bottom margin of the camera.
     * @param newMargin.top    The top margin of the camera.
     */
    public setMargin(newMargin: Partial<Margin>): void{
        this.margin = { ...this.margin, ...newMargin };
    }
}
