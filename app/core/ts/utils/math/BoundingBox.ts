import {Vector} from "Vector";

// A simple axis-aligned bounding box
export class BoundingBox {
    private min: Vector;
    private max: Vector;

    public constructor(min: Vector, max: Vector) {
        this.min = min.copy();
        this.max = max.copy();
    }

    public getMin(): Vector {
        return this.min.copy();
    }
    public getMax(): Vector {
        return this.max.copy();
    }
    public setMin(min: Vector): void {
        this.min.x = min.x;
        this.min.y = min.y;
    }
    public setMax(max: Vector): void {
        this.max.x = max.x;
        this.max.y = max.y;
    }

    public getWidth(): number {
        return this.max.x - this.min.x;
    }
    public getHeight(): number {
        return this.max.y - this.min.y;
    }
    public getArea(): number {
        return this.getWidth() * this.getHeight();
    }

    public getCenter(): Vector {
        return this.getMin().add(this.getMax()).scale(0.5);
    }
}
