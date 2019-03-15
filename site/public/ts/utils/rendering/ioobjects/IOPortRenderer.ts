import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        IO_PORT_LINE_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "../../Constants";

import {Renderer} from "../Renderer";
import {InputPort} from "../../../models/ioobjects/InputPort";
import {OutputPort} from "../../../models/ioobjects/OutputPort";

export const IOPortRenderer = (function() {
    return {
        renderIPort(renderer: Renderer, iport: InputPort, selected: boolean) {
            const o = iport.getOriginPos();
            const v = iport.getTargetPos();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            const circleFillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        },
        renderOPort(renderer: Renderer, oport: OutputPort, selected: boolean) {
            const o = oport.getOriginPos();
            const v = oport.getTargetPos();

            const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            const circleFillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        }
    };
})();
