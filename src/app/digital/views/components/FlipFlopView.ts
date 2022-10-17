import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {AnyComponent} from "core/models/types";

import {DigitalPortGroup} from "core/models/types/digital";

import {CircuitController} from "core/controllers/CircuitController";
import {ViewCircuitInfo}   from "core/views/BaseView";
import {ComponentView}     from "core/views/ComponentView";


export class FlipFlopView<
    Obj extends AnyComponent,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
    > extends ComponentView<Obj, Info> {

    public constructor(info: Info, obj: Obj, V: Vector) {
        super(info, obj, V(1, 1), "flipflop.svg"); // file location: src/site/pages/digital/public/img/items. Also temp placeholder as I figure the positioning.
    }

    protected override getBounds(): Rect {
        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === DigitalPortGroup.Input).length;
        return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
    }
}
