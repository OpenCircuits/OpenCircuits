import {GUID} from "core/internal";
import {ComponentView, PartialPortPos} from "core/internal/view/ComponentView";
import {RenderState} from "core/internal/view/rendering/RenderState";
import {Line} from "core/internal/view/rendering/shapes/Line";
import {Rectangle} from "core/internal/view/rendering/shapes/Rectangle";
import {DigitalComponentInfo} from "digital/internal/DigitalComponents";
import {Rect} from "math/Rect";
import {SVGDrawing} from "svg2canvas";
import {V, Vector} from "Vector";


export class SwitchView extends ComponentView {
    protected onImg: SVGDrawing;
    protected offImg: SVGDrawing;

    public constructor(compID: GUID, state: RenderState) {
        super(compID, state);

        this.onImg  = state.options.getImage("switchDown.svg")!;
        this.offImg = state.options.getImage("switchUp.svg")!;
    }

    protected get isOn(): boolean {
        return (this.component.props["isOn"] === true);
    }

    protected override renderComponent(): void {
        const { renderer, options } = this.state;
        const style = options.fillStyle(this.isSelected);

        renderer.draw(new Rectangle(V(), this.size), style)
    }

    protected override drawImg(): void {
        const { renderer, options } = this.state;

        const img = (this.isOn ? this.onImg : this.offImg);
        renderer.image(img, V(), V(0.96, 1.2), (this.isSelected ? options.selectedFillColor : undefined));
    }

    protected calcPortPosition(group: string, index: number): PartialPortPos {
        if (group !== "outputs")
            throw new Error(`ANDGateView: Unknown group ${group}!`);
        return { origin: V(0.62, 0), dir: V(1, 0) };
    }

    protected override getBounds(): Rect {
        throw new Error("Method not implemented.");
    }

    protected override get size(): Vector {
        return V(1.24, 1.54);
    }
}
