import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        DEFAULT_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {Rectangle} from "core/rendering/shapes/Rectangle";

import {IC} from "digital/models/ioobjects/other/IC";


/**
 * Render ICs using the following steps:
 * - Color and style border and fill as per selection status
 * - Draw Rectangle to size
 * - Render IC name aligned in center.
 */
export const ICRenderer = ({
    render(renderer: Renderer, _: Camera, ic: IC, selected: boolean): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);

        renderer.draw(new Rectangle(V(), ic.getSize()), style);

        renderer.text(ic.getData().getName(), V(), "center");
    },
});
