import {V} from "Vector";

import {Transform} from "math/Transform";

import {Schema} from "core/schema";

import {CirclePrim} from "./rendering/prims/CirclePrim";
import {Assembler}  from "./Assembler";


export class NodeAssembler extends Assembler<Schema.Component> {
    private assembleCircle(node: Schema.Component) {
        const { circleStyle } = this.options.portStyle(this.selections.has(node.id), false);
        const pos = this.cache.componentTransforms.get(node.id)!.getPos();
        return new CirclePrim(pos, this.options.defaultPortRadius, circleStyle);
    }

    public assemble(node: Schema.Component, _: unknown) {
        const transformChanged = /* use ev to see if parent transform changed */ true;
        const selectionChanged = /* use ev to see if parent wwas de/selected */ true;

        if (!transformChanged && !selectionChanged)
            return;

        if (transformChanged) {
            const pos = V(node.props.x ?? 0, node.props.y ?? 0);

            // Update transform
            this.cache.componentTransforms.set(node.id, new Transform(
                pos,
                V(2*this.options.defaultPortRadius),
                (node.props.angle ?? 0),
            ));

            // Update "port" positions
            const ports = this.circuit.doc.getPortsByGroup(node.id).unwrap();
            if (Object.entries(ports).length > 0) { // Need to make sure the ports are set
                // TODO[.](leon): transform the direction so that the angle of the node changes `dir`
                this.cache.portPositions.set(ports["inputs"][0],  { origin: pos, target: pos, dir: V(-1, 0) });
                this.cache.portPositions.set(ports["outputs"][0], { origin: pos, target: pos, dir: V(+1, 0) });
            }
        }

        const [prev] = (this.cache.componentPrims.get(node.id) ?? []);

        const circle = ((!prev || transformChanged) ? this.assembleCircle(node) : prev);

        // Update styles only if selections changed
        if (selectionChanged)
            circle.updateStyle(this.options.portStyle(this.selections.has(node.id), false).circleStyle);

        this.cache.componentPrims.set(node.id, [circle]);
    }
}
