import {IO_LABEL_DIR_PADDING, IO_LABEL_VERTICAL_TEXT_PADDING} from "core/utils/Constants";
import {V, Vector} from "Vector";
import {Clamp} from "math/MathUtils";

import {Camera} from "math/Camera";
import {Renderer} from "core/rendering/Renderer";
import {Component} from "core/models/Component";
import {Port} from "core/models";

/**
 * Renders IOLabels
 * * Check if Component is on screen, quit if not
 * * For each port, align and render name of port at port position
 */
export const IOLabelRenderer = (() => {

    const drawPortText = function(renderer: Renderer, port: Port, size: Vector): void {
        const align: CanvasTextAlign = "center";
        const textWidth = renderer.getTextWidth(port.getName());
        let pos = port.getOriginPos();

        // move a padding distance from the origin position
        pos = pos.add(port.getDir().scale(-IO_LABEL_DIR_PADDING));
        // move half the text width distance projected onto a horizontal vector
        pos = pos.add(port.getDir().scale(-textWidth/2).project(V(1,0)));
        // add in vertical direction so label is a bit farther from port
        pos = pos.add(port.getDir().scale(-IO_LABEL_VERTICAL_TEXT_PADDING).project(V(0,1)));

        // clamp the position inside the box
        const xBound = size.x/2 - IO_LABEL_DIR_PADDING - textWidth/2;
        const yBound = size.y/2 - 2*IO_LABEL_VERTICAL_TEXT_PADDING;
        pos.x = Clamp(pos.x, -xBound, xBound);
        pos.y = Clamp(pos.y, -yBound, yBound);

        renderer.text(port.getName(), pos, align);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component): void {
            if (!camera.cull(object.getCullBox()))
                return;

            const size = object.getTransform().getSize();
            object.getPorts().forEach((p) => drawPortText(renderer, p, size));
        }
    };

}) ();
