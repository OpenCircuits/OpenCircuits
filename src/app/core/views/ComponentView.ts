import {SVGDrawing} from "svg2canvas";

import {DEFAULT_BORDER_WIDTH, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {RectContains, TransformContains} from "math/MathUtils";
import {Rect}                            from "math/Rect";
import {Transform}                       from "math/Transform";

import {DirtyVar} from "core/utils/DirtyVar";
import {Images}   from "core/utils/Images";

import {AnyComponent} from "core/models/types";

import {CircuitController} from "core/controllers/CircuitController";

import {BaseView, RenderInfo, ViewCircuitInfo} from "./BaseView";


export class ComponentView<
    Obj extends AnyComponent,
    Info extends ViewCircuitInfo<CircuitController> = ViewCircuitInfo<CircuitController>,
> extends BaseView<Obj, Info> {
    protected transform: DirtyVar<Transform>;
    protected img?: SVGDrawing;

    public constructor(info: Info, obj: Obj, size?: Vector, imgName?: string) {
        super(info, obj);

        this.transform = new DirtyVar(
            () => new Transform(V(obj.x, obj.y), size, obj.angle),
        );

        // Get image if this view has one
        if (imgName) {
            const img = Images.GetImage(imgName);
            if (!img) {
                throw new Error(`ComponentView: failed to get image ${imgName} for` +
                                ` component ${obj.kind}[${obj.id}](${obj.name})`);
            }
            this.img = img;
        }
    }

    public override onPropChange(propKey: string): void {
        super.onPropChange(propKey);

        if (["x", "y", "angle"].includes(propKey))
            this.transform.setDirty();
    }

    public override contains(pt: Vector): boolean {
        return RectContains(this.transform.get(), pt);
    }

    public override isWithinBounds(bounds: Transform): boolean {
        return TransformContains(bounds, this.transform.get());
    }

    protected override renderInternal(info: RenderInfo): void {
        const { renderer } = info;

        // Transform into local space
        renderer.transform(this.transform.get());

        this.renderComponent(info);

        this.drawImg(info);
    }

    protected drawImg(info: RenderInfo): void {
        // Check if we should draw image
        if (!this.img)
            return;

        const { renderer, selections } = info;

        const selected = selections.has(this.obj.id);
        const tint = (selected ? SELECTED_FILL_COLOR : undefined);

        renderer.image(this.img, V(), this.transform.get().getSize(), tint);
    }

    protected renderComponent(_: RenderInfo): void {}

    public getTransform(): Transform {
        return this.transform.get();
    }

    public getSize(): Vector {
        return this.transform.get().getSize();
    }

    public override getMidpoint(): Vector {
        return this.transform.get().getPos();
    }

    public override getBounds(): Rect {
        const t = this.transform.get();
        return new Rect(t.getPos(), t.getSize());
    }
}
