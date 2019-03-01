import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        GATE_NOT_CIRCLE_RADIUS} from "../../../Constants";
import {Vector,V} from "../../../math/Vector";

import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";

import {SevenSegmentDisplay} from "../../../../models/ioobjects/outputs/SevenSegmentDisplay";

import {Images} from "../../../Images";

export var SevenSegmentDisplayRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, display: SevenSegmentDisplay, selected: boolean) {
            let transform = display.getTransform();

            let size = transform.getSize();

            // Draw background
            let borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            let fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            renderer.rect(0, 0, size.x, size.y, fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            // Draw lights
            let segments = display.getSegments();
            for (let i = 0; i < segments.length; i++) {
                let pos = segments[i++];
                let dir = segments[i];
                let on  = display.getInputPort(Math.floor(i / 2)).getIsOn();

                let imgNum = (dir.x == 1 ? (on ? "3" : "1") :
                                           (on ? "4" : "2"));
                let img = "segment" + imgNum + ".svg";

                let w = 35;
                let h = 9;

                pos = pos.scale(V(w/2, w));
                let size = (dir.x == 1 ? V(w, h) : V(h, w));
                renderer.image(Images.GetImage(img), pos.x, pos.y, size.x, size.y);
            }
        }
    };
})();
