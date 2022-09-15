import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        DEFAULT_FILL_COLOR,
        MULTIPLEXER_HEIGHT_OFFSET,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {Polygon} from "core/rendering/shapes/Polygon";

import {Demultiplexer} from "digital/models/ioobjects/other/Demultiplexer";
import {Multiplexer}   from "digital/models/ioobjects/other/Multiplexer";


/**
 * Renders Muxs using the following steps:
 * - Color and style border and fill as per selection status
 * - Draw Mux correct size and shape depending on whether it is a Multiplexor or Demultiplexor.
 */
export const MultiplexerRenderer = ({
    render(renderer: Renderer, _: Camera, mul: Multiplexer | Demultiplexer, selected: boolean): void {
        const transform = mul.getTransform();
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        //
        // Creates the Multiplexer and Demultiplexer the correct size
        //
        /* eslint-disable space-in-parens */
        if (mul instanceof Multiplexer) {
            const p1 = V(-transform.getSize().x/2,  transform.getSize().y/2);
            const p2 = V(-transform.getSize().x/2, -transform.getSize().y/2);
            const p3 = V( transform.getSize().x/2, -transform.getSize().y/2 + MULTIPLEXER_HEIGHT_OFFSET);
            const p4 = V( transform.getSize().x/2,  transform.getSize().y/2 - MULTIPLEXER_HEIGHT_OFFSET);

            // Renders to the beginning two points again in order to fully connect the last corner
            renderer.draw(new Polygon([p1, p2, p3, p4, p1, p2]), style);
        }
        else {
            const p1 = V( transform.getSize().x/2,  transform.getSize().y/2);
            const p2 = V( transform.getSize().x/2, -transform.getSize().y/2);
            const p3 = V(-transform.getSize().x/2, -transform.getSize().y/2 + MULTIPLEXER_HEIGHT_OFFSET);
            const p4 = V(-transform.getSize().x/2,  transform.getSize().y/2 - MULTIPLEXER_HEIGHT_OFFSET);

            // Renders to the beginning two points again in order to fully connect the last corner
            renderer.draw(new Polygon([p1, p2, p3, p4, p1, p2]), style);
        }
        /* eslint-enable space-in-parens */
    },
});
