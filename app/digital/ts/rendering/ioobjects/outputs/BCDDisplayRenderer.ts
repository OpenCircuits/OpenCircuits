import {DEFAULT_BORDER_WIDTH,
    DEFAULT_BORDER_COLOR,
    DEFAULT_FILL_COLOR,
    SELECTED_BORDER_COLOR,
    SELECTED_FILL_COLOR,
    DEFAULT_ON_COLOR,
    SEGMENT_DISPLAY_WIDTH} from "core/utils/Constants";
import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Rectangle} from "core/rendering/shapes/Rectangle";
import {Style} from "core/rendering/Style";

import {BCDDisplay} from "digital/models/ioobjects/outputs/BCDDisplay";

import {Images} from "digital/utils/Images";
import {Line} from "core/rendering/shapes/Line";

export const BCDDisplayRenderer = (() => {
   
    return {
        render(renderer: Renderer, _: Camera, display: BCDDisplay, selected: boolean): void {
            const transform = display.getTransform();

            const size = transform.getSize();

            // Draw background
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), size), style);

            const p1 = display.getPorts()[0].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            const p2 = display.getPorts()[display.getPorts().length-1].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            renderer.draw(new Line(p1, p2), style);            

        }
    };
})();