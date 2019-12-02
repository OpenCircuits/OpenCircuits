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

    public onTransformChange(): void {
        super.onTransformChange();
        this.dirtyShape = true;
    }

    protected updateCurve(): void {
        if (!this.dirtyShape)
            return;
        this.dirtyShape = false;

        if (this.p1 != null) {
            const pos = this.p1.getWorldTargetPos();
            const dir = this.p1.getWorldDir();
            this.shape.setP1(pos);
            this.shape.setC1(dir.scale(DEFAULT_SIZE).add(pos));
        }
        if (this.p2 != null) {
            const pos = this.p2.getWorldTargetPos();
            const dir = this.p2.getWorldDir();
            this.shape.setP2(pos);
            this.shape.setC2(dir.scale(DEFAULT_SIZE).add(pos));
        }
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

    public getXMLName(): string {
        return "wire";
    }
}
