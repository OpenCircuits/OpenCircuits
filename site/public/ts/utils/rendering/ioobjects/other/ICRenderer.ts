import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "../../../Constants";
import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";

import {IC} from "../../../../models/ioobjects/other/IC";

export var ICRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, ic: IC, selected: boolean) {
            let transform = ic.getTransform();

            var fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            var borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);

            renderer.rect(0, 0, transform.getSize().x, transform.getSize().y, fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        }
    };
})();
