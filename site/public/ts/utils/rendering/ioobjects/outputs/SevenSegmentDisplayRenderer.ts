import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "../../../Constants";
import {V} from "../../../math/Vector";

import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";

import {SevenSegmentDisplay} from "../../../../models/ioobjects/outputs/SevenSegmentDisplay";

import {Images} from "../../../Images";

import {Rectangle} from "../../shapes/Rectangle";
import {Style} from "../../Style";

export const SevenSegmentDisplayRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, display: SevenSegmentDisplay, selected: boolean): void {
            const transform = display.getTransform();

            const size = transform.getSize();

            // Draw background
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), size), style);

            // Draw lights
            const segments = display.getSegments();
            for (let i = 0; i < segments.length; i++) {
                let pos = segments[i++];
                const dir = segments[i];
                const on  = display.getInputPort(Math.floor(i / 2)).getIsOn();

                const imgNum = (dir.x == 1 ? (on ? "3" : "1") :
                                             (on ? "4" : "2"));
                const img = "segment" + imgNum + ".svg";

                const w = 35;
                const h = 9;

                pos = pos.scale(V(w/2, w));
                const size = (dir.x == 1 ? V(w, h) : V(h, w));
                renderer.image(Images.GetImage(img), pos, size);
            }
        }
    };
})();
