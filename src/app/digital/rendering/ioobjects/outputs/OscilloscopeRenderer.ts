import {blend, parseColor} from "svg2canvas";

import {SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        DEFAULT_BORDER_WIDTH} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Oscilloscope} from "digital/models/ioobjects";

import {Images} from "digital/utils/Images";
import {Circle} from "core/rendering/shapes/Circle";


export const OscilloscopeRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, o: Oscilloscope, selected: boolean): void {
            const transform = o.getTransform();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : "#ffffff");
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), transform.getSize()), style);
        }
    };
})();
