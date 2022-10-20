import {
    DEFAULT_BORDER_COLOR,
    DEFAULT_BORDER_WIDTH,
    DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR,
    SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR,
} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {Style} from "core/utils/rendering/Style";

import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {AnyComponent} from "core/models/types";

import {CircuitController}           from "core/controllers/CircuitController";
import {RenderInfo, ViewCircuitInfo} from "core/views/BaseView";
import {ComponentView}               from "core/views/ComponentView";


export class FlipFlopView<
    Obj extends AnyComponent,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
    > extends ComponentView<Obj, Info> {

    /**
     * This is a constructor for the FlopFlop superclass, which is a subclass of the Component class.
     * It takes two parameters, info and obj, and passes them to the superclass constructor,
     * along with two other parameters.
     * The first parameter, info, is an object that contains information about the item.
     * The second parameter, obj, is an object that contains information about the object that the item is in.
     *
     * @param info - Info - This is the info object that is passed to the constructor of the Item class.
     * @param obj  - The object that the item is attached to.
     * @param v    - Vector = V(1, 1).
     */
    public constructor(info: Info, obj: Obj, v: Vector = V(2, 2.4)) {
        super(info, obj, v); // file location: src/site/pages/digital/public/img/items. Also temp placeholder as I figure the positioning.
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

        const fillcol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);

        const style = new Style(fillcol , borderCol, DEFAULT_CURVE_BORDER_WIDTH);

        // Get size of model
        const size = this.transform.get().getSize();

        const rect = new Rect(V(0,0), size)

        renderer.draw(new Rectangle(rect), style);
    }
}
