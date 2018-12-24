import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        DEFAULT_ON_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        IO_PORT_LINE_WIDTH,
        IO_PORT_RADIUS,
        IO_PORT_BORDER_WIDTH} from "../../Constants";

import {Vector,V} from "../../math/Vector";
import {Renderer} from "../Renderer";
import {Camera} from "../../Camera";
import {InputPort} from "../../../models/ioobjects/InputPort";
import {OutputPort} from "../../../models/ioobjects/OutputPort";

export var IOPortRenderer = (function() {
    return {
        renderIPort(renderer: Renderer, camera: Camera, iport: InputPort, selected: boolean) {
            var o = iport.getOriginPos();
            var v = iport.getTargetPos();

            var borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            var circleFillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        },
        renderOPort(renderer: Renderer, camera: Camera, oport: OutputPort, selected: boolean) {
            var o = oport.getOriginPos();
            var v = oport.getTargetPos();

            var borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            renderer.line(o.x, o.y, v.x, v.y, borderCol, IO_PORT_LINE_WIDTH);

            var circleFillCol = (selected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
            renderer.circle(v.x, v.y, IO_PORT_RADIUS, circleFillCol, borderCol, IO_PORT_BORDER_WIDTH);
        }
    };
})();
