import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "../../../Constants";
import {V} from "../../../math/Vector";

import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";
import {Multiplexer} from "../../../../models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "../../../../models/ioobjects/other/Demultiplexer";

import {Polygon} from "../../shapes/Polygon";
import {Style} from "../../Style";

export const MultiplexerRenderer = (function() {

    return {
        render(renderer: Renderer, camera: Camera, mul: Multiplexer | Demultiplexer, selected: boolean) {
            const transform = mul.getTransform();
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            //
            // Creates the Multiplexer and Demultiplexer the correct size
            //
            if (mul instanceof Multiplexer){
                const p1 = V(-transform.getSize().x/2 , transform.getSize().y/2 + 7);
                const p2 = V(-transform.getSize().x/2 , -transform.getSize().y/2 - 7);
                const p3 = V(transform.getSize().x/2 , -transform.getSize().y/2 + 18);
                const p4 = V(transform.getSize().x/2 , transform.getSize().y/2 - 18);

                renderer.draw(new Polygon([p1, p2, p3, p4]), style);
            }
            else {
                const p1 = V(transform.getSize().x/2 , transform.getSize().y/2 + 7);
                const p2 = V(transform.getSize().x/2 , -transform.getSize().y/2 - 7);
                const p3 = V(-transform.getSize().x/2, -transform.getSize().y/2 + 18);
                const p4 = V(-transform.getSize().x/2, transform.getSize().y/2 - 18);

                renderer.draw(new Polygon([p1, p2, p3, p4]), style);
            }
        }
    }
})();
