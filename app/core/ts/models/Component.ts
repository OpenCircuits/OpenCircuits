import {DEFAULT_BORDER_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH,
        WIRE_SNAP_THRESHOLD} from "digital/utils/Constants";

import {Vector,V}     from "Vector";
import {Transform}    from "math/Transform";
import {RectContains} from "math/MathUtils";
import {XMLNode}      from "core/utils/io/xml/XMLNode";

import {Port}       from "./ports/Port";

import {CullableObject}   from "./CullableObject";
import {Wire}       from "./Wire";

function Snap(wire: Wire, x: number, c: number): number {
    if (Math.abs(x - c) <= WIRE_SNAP_THRESHOLD) {
        wire.setIsStraight(true);
        return c;
    }
    return x;
}

export abstract class Component extends CullableObject {
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
        // Snap to connections
        for (const port of this.getPorts()) {
            const pos = port.getWorldTargetPos().sub(this.getPos());
            const wires = port.getWires();
            for (const w of wires) {
                // Get the port that isn't the current port
                const port2 = (w.getP1() == port ? w.getP2() : w.getP1());
                w.setIsStraight(false);
                v.x = Snap(w, v.x + pos.x, port2.getWorldTargetPos().x) - pos.x;
                v.y = Snap(w, v.y + pos.y, port2.getWorldTargetPos().y) - pos.y;
            }
        }

        this.transform.setPos(v);
        this.onTransformChange();
    }

    public setAngle(a: number): void {
        this.transform.setAngle(a);
        this.onTransformChange();
    }

    public setRotationAbout(a: number, c: Vector): void {
        this.transform.setRotationAbout(a, c);
        this.onTransformChange();
    }


    /**
     * Determines whether or not a point is within
     *  this component's "pressable" bounds (always false)
     *  for most components
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinPressBounds(_: Vector): boolean {
        return false;
    }

    /**
     * Determines whether or not a point is within
     *  this component's "selectable" bounds
     * @param  v The point
     * @return   True if the point is within this component,
     *           false otherwise
     */
    public isWithinSelectBounds(v: Vector): boolean {
        return RectContains(this.getTransform(), v) &&
                !this.isWithinPressBounds(v);
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


    public getMinPos(): Vector {
        const min = V(Infinity);

        // Find minimum pos from corners of transform
        const corners = this.transform.getCorners().map(
            v => v.sub(DEFAULT_BORDER_WIDTH)
        );

        // Find minimum pos from ports
        const ports = this.getPorts().map(
            p => p.getWorldTargetPos().sub(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.min(min, ...corners, ...ports);
    }

    public getMaxPos(): Vector {
        const max = V(-Infinity);

        // Find maximum pos from corners of transform
        const corners = this.transform.getCorners().map(
            v => v.add(DEFAULT_BORDER_WIDTH)
        );

        // Find maximum pos from ports
        const ports = this.getPorts().map(
            p => p.getWorldTargetPos().add(IO_PORT_RADIUS+IO_PORT_BORDER_WIDTH)
        );

        return Vector.max(max, ...corners, ...ports);
    }


    public copy(): Component {
        const copy = <Component>super.copy();
        copy.transform = this.transform.copy();
        return copy;
    }

    public save(node: XMLNode): void {
        super.save(node);
        node.addVectorAttribute("", this.getPos());
        node.addAttribute("angle", this.getAngle());
    }

    public load(node: XMLNode): void {
        super.load(node);
        this.setPos(node.getVectorAttribute(""));
        this.setAngle(node.getFloatAttribute("angle"));
    }


    public getImageName(): string {
        return undefined;
    }
}
