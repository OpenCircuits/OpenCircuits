import {DEFAULT_BORDER_COLOR,
        DEFAULT_FILL_COLOR,
        IO_PORT_BORDER_WIDTH,
        IO_PORT_LINE_WIDTH,
        IO_PORT_RADIUS,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {Circle} from "core/rendering/shapes/Circle";
import {Line}   from "core/rendering/shapes/Line";

import {Port} from "core/models/ports/Port";


/**
 * Renders Ports.
 * Color, style, draw port line - selected colour only if parent object
 *                                is selected as a whole without separate port selection.
 * Color, style, draw port border and fill - selected colour both if port or parent object are selected.
 */
export const IOPortRenderer = ({
    renderPort(renderer: Renderer, port: Port, selected: boolean, portSelected: boolean): void {
        const o = port.getOriginPos();
        const v = port.getTargetPos();

        const lineCol = (selected && !portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const lineStyle = new Style(undefined, lineCol, IO_PORT_LINE_WIDTH);

        renderer.draw(new Line(o, v), lineStyle);

        const borderCol = (selected || portSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const circleFillCol = (selected || portSelected ? SELECTED_FILL_COLOR : DEFAULT_FILL_COLOR);
        const circleStyle = new Style(circleFillCol, borderCol, IO_PORT_BORDER_WIDTH)

        renderer.draw(new Circle(v, IO_PORT_RADIUS), circleStyle);
    },
});
