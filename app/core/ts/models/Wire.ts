import {DEFAULT_SIZE,
        WIRE_THICKNESS} from "digital/utils/Constants";

import {V,Vector} from "Vector";
import {BezierCurve} from "math/BezierCurve";
import {XMLNode} from "core/utils/io/xml/XMLNode";

import {OutputPort} from "../../../digital/ts/models/ports/OutputPort";
import {InputPort}  from "../../../digital/ts/models/ports/InputPort";
import {CullableObject}   from "./CullableObject";
import {Component}  from "./Component";
import {Port} from "./ports/Port";
import {Node} from "./Node";

export abstract class Wire extends CullableObject {
    protected p1: Port;
    protected p2: Port;

    private shape: BezierCurve;
    private straight: boolean;

    private dirtyShape: boolean;

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

    private updateCurve(): void {
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

    public connect(): void {

    }

    public disconnect(): void {

    }

    public abstract split(): Node & Component;

    // public setInput(c: OutputPort): void {
    //     if (c == this.input)
    //         return;

    //     this.input = c;
    //     this.onTransformChange();
    // }

    // public setOutput(c: InputPort): void {
    //     if (c == this.output)
    //         return;

    //     this.output = c;
    //     this.onTransformChange();
    // }

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

    public copyInto(w: Wire): void {
        w.straight = this.straight;
        this.onTransformChange();
    }

    public save(node: XMLNode): void {
        super.save(node);

        // save properties
        node.addAttribute("straight", this.straight);

        // write curve
        const curveNode = node.createChild("curve");
        curveNode.addVectorAttribute("p1", this.shape.getP1());
        curveNode.addVectorAttribute("p2", this.shape.getP2());
        curveNode.addVectorAttribute("c1", this.shape.getC1());
        curveNode.addVectorAttribute("c2", this.shape.getC2());
    }

    public load(node: XMLNode): void {
        super.load(node);

        // load properties
        this.straight = node.getBooleanAttribute("straight");

        // load curve
        const curveNode = node.findChild("curve");
        this.shape.setP1(curveNode.getVectorAttribute("p1"));
        this.shape.setP2(curveNode.getVectorAttribute("p2"));
        this.shape.setC1(curveNode.getVectorAttribute("c1"));
        this.shape.setC2(curveNode.getVectorAttribute("c2"));
    }

    public getDisplayName(): string {
        return "Wire";
    }

    public getXMLName(): string {
        return "wire";
    }
}
