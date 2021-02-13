import {DEFAULT_BORDER_WIDTH,
        DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";
import {V} from "Vector";
import {Camera} from "math/Camera";

import {Style} from "core/rendering/Style";
import {Rectangle} from "core/rendering/shapes/Rectangle";
import {Renderer} from "core/rendering/Renderer";

import {IC} from "digital/models/ioobjects/other/IC";

export const ICRenderer = (() => {
    return {
        render(renderer: Renderer, _: Camera, ic: IC, selected: boolean): void {
            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

            renderer.draw(new Rectangle(V(), ic.getSize()), style);

            renderer.text(ic.getData().getName(), V(), "center");
        }
    }
})();
