import {DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH, DEFAULT_CURVE_BORDER_WIDTH, DEFAULT_FILL_COLOR, DEFAULT_ON_COLOR, SELECTED_BORDER_COLOR, SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Rect} from "math/Rect";

import {Renderer}             from "core/utils/rendering/Renderer";
import {Style}                from "core/utils/rendering/Style";
import {FONT_CONSTANT_NUMBER} from "core/utils/rendering/Styles";

import {Line}      from "core/utils/rendering/shapes/Line";
import {Rectangle} from "core/utils/rendering/shapes/Rectangle";

import {ConstantNumber} from "core/models/types/digital";

import {RenderInfo}    from "core/views/BaseView";
import {ComponentView} from "core/views/ComponentView";

import {DigitalViewInfo} from "../DigitalViewInfo";


export class ConstantNumberView extends ComponentView<ConstantNumber, DigitalViewInfo> {
    public constructor(info: DigitalViewInfo, obj: ConstantNumber) {
        super(info, obj, V(1, 1), undefined);
    }

    // Function to draw the line connecting the 4 outputs
    protected drawOutputConnector = function(renderer: Renderer, size: Vector, borderColor: string): void {
        const style = new Style(undefined, borderColor, DEFAULT_BORDER_WIDTH);
        // Y coordinates of the top and bottom
        const l1 = -(size.y/2)*(1.5);
        const l2 =  (size.y/2)*(1.5);
        // X coordinate to draw the vertical line
        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        renderer.draw(new Line(V(s, l1), V(s, l2)), style);
    }

    // Function to draw the input value on the component
    protected drawInputText = function(renderer: Renderer, value: number): void {
        // to adjust for cap-height of the Arial font (see https://stackoverflow.com/questions/61747006)
        const FONT_CAP_OFFSET = 0.06;

        const text = value < 10 ? value.toString() : "ABCDEF".charAt(value - 10);
        renderer.text(text, V(0, FONT_CAP_OFFSET), "center", DEFAULT_ON_COLOR, FONT_CONSTANT_NUMBER);
    }

    protected override renderComponent({ renderer, selections }: RenderInfo): void {
        const selected = selections.has(this.obj.id);

        // Get size of model
        const size = this.transform.get().getSize();

        const fillColor = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;

        const borderColor = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
        const style = new Style(fillColor, borderColor, DEFAULT_BORDER_WIDTH);

        // Draw the rectangle first, subtracting border width for alignment
        const rectSize = size.sub(DEFAULT_BORDER_WIDTH);
        renderer.draw(new Rectangle(V(), rectSize), style);

        // Connect the output lines together and draw the text
        this.drawOutputConnector(renderer, size, borderColor);
        this.drawInputText(renderer, this.obj.inputNum);
    }

    public override getBounds(): Rect {
        // Get current number of inputs
        const inputs = this.circuit.getPortsFor(this.obj)
            .filter((p) => p.group === "inputs").length;
        return super.getBounds().expand(V(0, ((inputs-1)/2*(0.5 - DEFAULT_BORDER_WIDTH/2) + DEFAULT_BORDER_WIDTH/2)));
    }
}
