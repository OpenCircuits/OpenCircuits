import {DEFAULT_BORDER_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "core/utils/Constants";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {serialize}    from "serialeazy";

import {Port}       from "./ports/Port";

import {CullableObject}   from "./CullableObject";
import {Wire}       from "./Wire";

export abstract class Component extends CullableObject {
    @serialize
    protected transform: Transform;

    protected constructor(size: Vector) {
        super();

        this.transform = new Transform(V(), size);
    }

    public onTransformChange(): void {
        super.onTransformChange();
        this.getConnections().forEach((w) => w.onTransformChange());
    }

    public setPos(v: Vector): void {
        this.transform.setPos(v);
        this.onTransformChange();
    }

    public setAngle(a: number): void {
        this.transform.setAngle(a);
        this.onTransformChange();
    }

    public setSize(s: Vector): void {
        this.transform.setSize(s);
        this.onTransformChange();
    }

    public setRotationAbout(a: number, c: Vector): void {
        this.transform.setRotationAbout(a, c);
        this.onTransformChange();
    }

    /**
     * Determines whether or not a point is within
     *  this component's "selectable" bounds
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinSelectBounds(v: Vector): boolean {
        return RectContains(this.getTransform(), v);
    }

    public abstract getPorts(): Port[];

    public getConnections(): Wire[] {
        return this.getPorts().flatMap(p => p.getWires());
    }

    public getPos(): Vector {
        return this.transform.getPos();
    }

    public getSize(): Vector {
        return this.transform.getSize();
    }

    public getAngle(): number {
        return this.transform.getAngle();
    }

    public getTransform(): Transform {
        return this.transform.copy();
    }

    public getOffset(): Vector {
        return V(DEFAULT_BORDER_WIDTH);
    }

    public getMinPos(): Vector {
        const min = V(Infinity);

        // Find minimum pos from corners of transform with added offset
        const corners = this.transform.getCorners().map(
            v => v.sub(this.getOffset())
        );

        // Find minimum pos from ports
        const ports = this.getPorts().map(
            p => p.getWorldTargetPos().sub(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.min(min, ...corners, ...ports);
    }

    public getMaxPos(): Vector {
        const max = V(-Infinity);

        // Find maximum pos from corners of transform with added offset
        const corners = this.transform.getCorners().map(
            v => v.add(this.getOffset())
        );

        // Find maximum pos from ports
        const ports = this.getPorts().map(
            p => p.getWorldTargetPos().add(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.max(max, ...corners, ...ports);
    }

    public getImageName(): string {
        return undefined;
    }
}
