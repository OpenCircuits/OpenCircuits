import {DEFAULT_BORDER_WIDTH,
        IO_PORT_BORDER_WIDTH,
        IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {GenPropInfo} from "core/utils/PropInfoUtils";
import {AngleInfo}   from "core/utils/Units";

import {CullableObject} from "./CullableObject";
import {Port}           from "./ports/Port";
import {Prop}           from "./PropInfo";
import {Wire}           from "./Wire";


const [Info, InitialInfo] = GenPropInfo({
    infos: {
        "pos": {
            type:    "vecf",
            label:   "Position",
            step:    V(1, 1),
            initial: V(),
        },
        "size": {
            type:    "vecf",
            label:   "Size",
            initial: V(),

            isActive: () => false,
        },
        ...AngleInfo("angle", "Angle", 0, "deg", 45),
    },
});

export abstract class Component extends CullableObject {
    protected transform: Transform;
    protected dirtyTransform: boolean;

    protected constructor(size: Vector, initialProps: Record<string, Prop> = {}) {
        super({ ...InitialInfo, size, ...initialProps });

        this.transform = new Transform(V(), size);
        this.dirtyTransform = true;
    }

    public override setProp(key: string, val: Prop): void {
        super.setProp(key, val);

        if (key === "pos" || key === "angle" || key === "size")
            this.onTransformChange();
    }

    public override onTransformChange(): void {
        super.onTransformChange();
        this.dirtyTransform = true;
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
            this.getTransform().calcRotationAbout(a - this.getAngle(), c);
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
        if (this.dirtyTransform) {
            this.transform.setPos(this.props["pos"] as Vector);
            this.transform.setSize(this.props["size"] as Vector);
            this.transform.setAngle(this.props["angle"] as number);
            this.dirtyTransform = false;
        }
        return this.transform;
    }

    public getOffset(): Vector {
        return V(DEFAULT_BORDER_WIDTH);
    }

    public override getPropInfo(key: string) {
        return Info[key] ?? super.getPropInfo(key);
    }

    public getMinPos(): Vector {
        const min = V(Infinity);

        // Find minimum pos from corners of transform with added offset
        const corners = this.getTransform().getCorners().map(
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
        const corners = this.getTransform().getCorners().map(
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
