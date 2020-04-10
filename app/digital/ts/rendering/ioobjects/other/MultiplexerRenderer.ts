import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        MULTIPLEXER_HEIGHT_OFFSET} from "core/utils/Constants";
import {V} from "Vector";

import {Renderer} from "../../../../../core/ts/rendering/Renderer";
import {Camera} from "math/Camera";
import {Multiplexer}   from "digital/models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "digital/models/ioobjects/other/Demultiplexer";

import {Polygon} from "../../../../../core/ts/rendering/shapes/Polygon";
import {Style} from "../../../../../core/ts/rendering/Style";

export const MultiplexerRenderer = (() => {

    return {
        render(renderer: Renderer, _: Camera, mul: Multiplexer | Demultiplexer, selected: boolean): void {
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
                const p3 = V(transform.getSize().x/2 , -transform.getSize().y/2 + MULTIPLEXER_HEIGHT_OFFSET);
                const p4 = V(transform.getSize().x/2 , transform.getSize().y/2 - MULTIPLEXER_HEIGHT_OFFSET);

                renderer.draw(new Polygon([p1, p2, p3, p4]), style);               
            }
            else {
                const p1 = V(transform.getSize().x/2 , transform.getSize().y/2 + 7);
                const p2 = V(transform.getSize().x/2 , -transform.getSize().y/2 - 7);
                const p3 = V(-transform.getSize().x/2, -transform.getSize().y/2 + MULTIPLEXER_HEIGHT_OFFSET);
                const p4 = V(-transform.getSize().x/2, transform.getSize().y/2 - MULTIPLEXER_HEIGHT_OFFSET);

                renderer.draw(new Polygon([p1, p2, p3, p4]), style);
            }

            // Label inputs with binary string representations
            const selectCount = mul.getSelectPortCount().getValue();
            const align: CanvasTextAlign = (mul instanceof Multiplexer ? "left" : "right");
            const portLabelPosition = mul instanceof Multiplexer ? 
                V(-transform.getSize().x/2 + 4, transform.getSize().y/2 - 11) :
                V( transform.getSize().x/2 - 4, transform.getSize().y/2 - 11);
            let numStr = "0".repeat(selectCount);

            for (let i = 0; i < Math.pow(2, selectCount); i++) {
                renderer.text(numStr, portLabelPosition, align);
                portLabelPosition.y -= 25;
                // increment the binary string
                const changeIndex = numStr.lastIndexOf("0");
                numStr = numStr.substr(0, changeIndex) + "1" + "0".repeat(numStr.length - changeIndex - 1);
            }
        }
    }
})();
