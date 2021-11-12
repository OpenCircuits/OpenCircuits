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

import {SegmentDisplay} from "digital/models/ioobjects/outputs/SegmentDisplay";

import {Images} from "digital/utils/Images";
import {Line} from "core/rendering/shapes/Line";

/**
 * Renders SegmentDisplay
 * * Colour and style border and fill as per selection status
 * * Draws line spanning length between first and last input ports
 * * Draw segments one by one - prioritize on colour, else colour as per selection status
 */
export const SegmentDisplayRenderer = (() => {

    return {
        render(renderer: Renderer, _: Camera, display: SegmentDisplay, selected: boolean): void {
            const transform = display.getTransform();

            const size = transform.getSize().sub(DEFAULT_BORDER_WIDTH);

            // Draw background
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
            renderer.draw(new Rectangle(V(), size), style);

            const p1 = display.getPorts()[0].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            const p2 = display.getPorts()[display.getPorts().length-1].getOriginPos().sub(DEFAULT_BORDER_WIDTH/2, 0);
            renderer.draw(new Line(p1, p2), style);

            // Draw lights
            const segments = display.getSegments();
            for (let i = segments.length - 1; i >= 0; i--) {
                const pos = segments[i][0].scale(V(SEGMENT_DISPLAY_WIDTH));
                const type = segments[i][1];
                const on  = display.isSegmentOn(i);

                const col = (on ? DEFAULT_ON_COLOR : (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR));

                const img = Images.GetImage(`segment_${type}.svg`);
                const size = V(img.width, img.height).scale(0.1);
                renderer.image(img, pos, size, col);
            }
        }
    };
})();
