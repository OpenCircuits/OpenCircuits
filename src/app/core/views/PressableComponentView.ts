import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {RectContains} from "math/MathUtils";
import {Transform}    from "math/Transform";

import {DirtyVar} from "core/utils/DirtyVar";

import {Style} from "core/utils/rendering/Style";

import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {AnyComponent} from "core/models/types";

import {CircuitController}           from "core/controllers/CircuitController";
import {RenderInfo, ViewCircuitInfo} from "core/views/BaseView";
import {ComponentView}               from "core/views/ComponentView";


export class PressableComponentView<
    Obj extends AnyComponent,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> extends ComponentView<Obj, Info> {
    protected pressableTransform: DirtyVar<Transform>;

    public constructor(info: Info, obj: Obj, size: Vector, pressableSize: Vector) {
        super(info, obj, size);

        this.pressableTransform = new DirtyVar(
            () => new Transform(
                this.transform.get().getPos(),
                pressableSize,
                this.transform.get().getAngle(),
            )
        );
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle"].includes(propKey))
            this.pressableTransform.setDirty();
    }

    public onPress(): void {}
    public onRelease(): void {}
    public onClick(): void {}

    // TODO: move this to a PressableComponentController or something?
    //  it also should be causing a propagation change, not an image change
    //  and the image will be calculated based on the propagation

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        // Draw box behind pressable component
        renderer.draw(new Rectangle(V(), this.transform.get().getSize()), style);
    }

    public isWithinPressBounds(pt: Vector): boolean {
        return RectContains(this.pressableTransform.get(), pt);
    }
}
