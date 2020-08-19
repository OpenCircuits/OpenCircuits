import {DEFAULT_SIZE,
        WIRE_THICKNESS} from "core/utils/Constants";

import {V,Vector} from "Vector";
import {BezierContains} from "math/MathUtils";
import {BezierCurve} from "math/BezierCurve";

import {CullableObject}   from "./CullableObject";
import {Component}  from "./Component";
import {Port} from "./ports/Port";
import {Node} from "./Node";
import {serialize} from "serialeazy";

export abstract class Wire extends CullableObject {
    @serialize
    protected p1: Port;
    @serialize
    protected p2: Port;

    @serialize
    protected shape: BezierCurve;
    @serialize
    protected straight: boolean;

    protected dirtyShape: boolean;

    public constructor(p1: Port, p2: Port) {
        super();

        this.p1 = p1;
        this.p2 = p2;

        this.shape = new BezierCurve(V(),V(),V(),V());
        this.straight = false;

        this.dirtyShape = true;
    }

    private calculateShape(port: Port): [Vector, Vector] {
        const pos = port.getWorldTargetPos();
        const dir = port.getWorldDir();

        // For straight bezier curves, Control point needs to be at the Point
        const c = (this.straight) ? (pos) : (pos.add(dir.scale(DEFAULT_SIZE)));

        return [pos, c];
    }

    protected updateCurve(): void {
        if (!this.dirtyShape)
            return;
        this.dirtyShape = false;

        if (this.p1) {
            const [p1, c1] = this.calculateShape(this.p1);
            this.shape.setP1(p1);
            this.shape.setC1(c1);
        }
        if (this.p2) {
            const [p2, c2] = this.calculateShape(this.p2);
            this.shape.setP2(p2);
            this.shape.setC2(c2);
        }
    }

    public onTransformChange(): void {
        super.onTransformChange();
        this.dirtyShape = true;
    }

    public abstract split(): Node;

    public isWithinSelectBounds(v: Vector): boolean {
        return BezierContains(this.getShape(), v);
    }

    public setIsStraight(straight: boolean): void {
        if (straight == this.straight)
            return;

        this.straight = straight;
        this.onTransformChange();
    }

    public getP1(): Port {
        return this.p1;
    }

    public getP1Component(): Component {
        return this.p1.getParent();
    }

    public getP2(): Port {
        return this.p2;
    }

    public getP2Component(): Component {
        return this.p2.getParent();
    }

    public getShape(): BezierCurve {
        this.updateCurve();
        return this.shape;
    }

    public isStraight(): boolean {
        return this.straight;
    }

    public getMinPos(): Vector {
        return this.getShape().getBoundingBox()
                .getBottomLeft().sub(WIRE_THICKNESS/2);
    }

    public getMaxPos(): Vector {
        return this.getShape().getBoundingBox()
                .getTopRight().add(WIRE_THICKNESS/2);
    }

    public getDisplayName(): string {
        return "Wire";
    }
}
