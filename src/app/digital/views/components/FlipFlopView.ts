import {DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

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

    /**
     * This is a constructor for the FlopFlop superclass, which is a subclass of the Component class.
     * It takes two parameters, info and obj, and passes them to the superclass constructor, along with two other parameters.
     *
     * The first parameter, info, is an object that contains information about the item.
     * The second parameter, obj, is an object that contains information about the object that the item is in.
     *
     * @param info - Info - This is the info object that is passed to the constructor of the Item class.
     *                      It contains the following properties:
     * @param obj  - The object that the item is attached to.
     */
    public constructor(info: Info, obj: Obj) {
        super(info, obj, V(1, 1), "and.svg"); // file location: src/site/pages/digital/public/img/items. Also temp placeholder as I figure the positioning.
    }

    protected override getBounds(): Rect {
        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === DigitalPortGroup.Input).length;
        return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
    }
}
