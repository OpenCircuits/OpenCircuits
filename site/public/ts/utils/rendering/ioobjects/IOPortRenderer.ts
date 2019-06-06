import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        IO_PORT_LINE_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_SELECT_RADIUS,
        IO_PORT_BORDER_WIDTH,
        DEBUG_SELECTION_BOUNDS,
        DEBUG_SELECTIONS_FILL_COLOR,
        DEBUG_SELECTIONS_STROKE_COLOR} from "../../Constants";

import {Renderer} from "../Renderer";
import {Port} from "../../../models/ioobjects/Port";

export const IOPortRenderer = (function() {
    return {
        renderPort(renderer: Renderer, port: Port, selected: boolean, portSelected: boolean) {
            const o = port.getOriginPos();
            const v = port.getTargetPos();

            const lineCol = (selected && !portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, lineCol, IO_PORT_LINE_WIDTH);

            const borderCol = (selected || portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const circleFillCol = (selected || portSelected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);

            if (DEBUG_SELECTION_BOUNDS) {
                renderer.circle(v.x, v.y, IO_PORT_SELECT_RADIUS, DEBUG_SELECTIONS_FILL_COLOR, DEBUG_SELECTIONS_STROKE_COLOR, 1, 0.5);
            }
        }
    };
})();
