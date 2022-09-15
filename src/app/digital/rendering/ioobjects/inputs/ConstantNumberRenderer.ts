import {FONT_CONSTANT_NUMBER} from "core/rendering/Styles";
import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        DEFAULT_FILL_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR}  from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {Line}      from "core/rendering/shapes/Line";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {ConstantNumber} from "digital/models/ioobjects";


export const ConstantNumberRenderer = (() => {

    // Function to draw the line connecting the 4 outputs
    const drawOutputConnector = function(renderer: Renderer, size: Vector, borderColor: string): void {
        const style = new Style(undefined, borderColor, DEFAULT_BORDER_WIDTH);
        // Y coordinates of the top and bottom
        const l1 = -(size.y/2)*(1.5);
        const l2 =  (size.y/2)*(1.5);
        // X coordinate to draw the vertical line
        const s = (size.x-DEFAULT_BORDER_WIDTH)/2;
        renderer.draw(new Line(V(s, l1), V(s, l2)), style);
    }

    // Function to draw the input value on the component
    const drawInputText = function(renderer: Renderer, value: number): void {
        // to adjust for cap-height of the Arial font (see https://stackoverflow.com/questions/61747006)
        const FONT_CAP_OFFSET = 0.06;

        const text = value < 10 ? value.toString() : "ABCDEF".charAt(value - 10);
        renderer.text(text, V(0, FONT_CAP_OFFSET), "center", DEFAULT_ON_COLOR, FONT_CONSTANT_NUMBER);
    }

    return {
        render(renderer: Renderer, object: ConstantNumber, selected: boolean): void {
            const transform = object.getTransform();
            const fillColor = selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR;

            const borderColor = selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
            const style = new Style(fillColor, borderColor, DEFAULT_BORDER_WIDTH);

            // Draw the rectangle first, subtracting border width for alignment
            const rectSize = transform.getSize().sub(DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), rectSize), style);

            // Connect the output lines together and draw the text
            drawOutputConnector(renderer, transform.getSize(), borderColor);
            drawInputText(renderer, object.getProp("inputNum") as number);
        },
    };
})();
