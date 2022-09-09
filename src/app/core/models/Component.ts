import {DEFAULT_BORDER_WIDTH,
        IO_PORT_BORDER_WIDTH,
        IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {CullableObject} from "./CullableObject";
import {Port}           from "./ports/Port";
import {Prop}           from "./PropInfo";
import {Wire}           from "./Wire";


export abstract class Component extends CullableObject {
    protected transform: Transform;

    protected constructor(size: Vector, initialProps: Record<string, Prop> = {}) {
        super({
            ...initialProps,
            "pos":   V(),
            "size":  size,
            "angle": 0,
        });

        this.transform = new Transform(V(), size);
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "pos") {
            this.transform.setPos(val as Vector);
            this.onTransformChange();
        } else if (key === "size") {
            this.transform.setSize(val as Vector);
            this.onTransformChange();
        } else if (key === "angle") {
            this.transform.setAngle(val as number);
            this.onTransformChange();
        }
    }

    public override onTransformChange(): void {
        super.onTransformChange();
        this.getConnections().forEach((w) => w.onTransformChange());
    }

    public setPos(v: Vector): void {
        this.setProp("pos", v);
    }

    public setAngle(a: number): void {
        this.setProp("angle", a);
    }

    public setSize(s: Vector): void {
        this.setProp("size", s);
    }

    public setRotationAbout(a: number, c: Vector): void {
        const [newPos, newAngle] =
            this.transform.calcRotationAbout(a - this.transform.getAngle(), c);
        this.setPos(newPos);
        this.setAngle(newAngle);
    }

    /**
     * Determines whether or not a point is within
     *  this component's "selectable" bounds.
     *
     * @param v The point.
     * @returns   True if the point is within this component,
     *    false otherwise.
     */
    public isWithinSelectBounds(v: Vector): boolean {
        return RectContains(this.getTransform(), v);
    }

    public abstract getPorts(): Port[];

    public getConnections(): Wire[] {
        return this.getPorts().flatMap((p) => p.getWires());
    }

    public getPos(): Vector {
        return this.props["pos"] as Vector;
    }

    public getSize(): Vector {
        return this.props["size"] as Vector;
    }

    public getAngle(): number {
        return this.props["angle"] as number;
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
            (v) => v.sub(this.getOffset())
        );

        // Find minimum pos from ports
        const ports = this.getPorts().map(
            (p) => p.getWorldTargetPos().sub(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.Min(min, ...corners, ...ports);
    }

    public getMaxPos(): Vector {
        const max = V(-Infinity);

        // Find maximum pos from corners of transform with added offset
        const corners = this.transform.getCorners().map(
            (v) => v.add(this.getOffset())
        );

        // Find maximum pos from ports
        const ports = this.getPorts().map(
            (p) => p.getWorldTargetPos().add(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.Max(max, ...corners, ...ports);
    }

    public getImageName(): string | undefined {
        return undefined;
    }
}
