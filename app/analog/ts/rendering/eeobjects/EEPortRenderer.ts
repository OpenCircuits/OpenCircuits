import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        IO_PORT_LINE_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "../../Constants";

import {Renderer} from "../Renderer";
import {EEPort} from "../../../models/eeobjects/EEPort";

export const EEPortRenderer = (function() {
    return {
        renderPort(renderer: Renderer, port: EEPort, selected: boolean, portSelected: boolean) {
            const o = port.getOriginPos();
            const v = port.getTargetPos();

            const lineCol = (selected && !portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, lineCol, IO_PORT_LINE_WIDTH);

            const borderCol = (selected || portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            const circleFillCol = (selected || portSelected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        }
    };
})();
