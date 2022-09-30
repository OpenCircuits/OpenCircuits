import {IO_PORT_RADIUS} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {CircleContains} from "math/MathUtils";

import {AnyNode} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {ComponentView} from "./ComponentView";


export abstract class NodeView<
    Node extends AnyNode,
    Circuit extends CircuitController = CircuitController,
> extends ComponentView<Node, Circuit> {
    public constructor(circuit: Circuit, obj: Node) {
        super(circuit, obj, V(2*IO_PORT_RADIUS));
    }

    public override contains(pt: Vector): boolean {
        return CircleContains(this.getMidpoint(), IO_PORT_RADIUS, pt);
    }

    protected override renderComponent(): void {
        // Nothing to draw, the port drawing will draw it
    }
}
