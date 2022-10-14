import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircleContains} from "math/MathUtils";

import {AnyNode} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {ViewCircuitInfo} from "./BaseView";
import {ComponentView}   from "./ComponentView";


export abstract class NodeView<
    Node extends AnyNode,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> extends ComponentView<Node, Info> {
    public constructor(info: Info, obj: Node) {
        super(info, obj, V(2*IO_PORT_RADIUS));
    }

    public override contains(pt: Vector): boolean {
        return CircleContains(this.getMidpoint(), IO_PORT_RADIUS, pt);
    }

    protected override renderComponent(): void {
        // Nothing to draw, the port drawing will draw it
    }
}
