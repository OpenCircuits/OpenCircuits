import {IO_LABEL_DIR_PADDING, IO_LABEL_VERTICAL_TEXT_PADDING} from "core/utils/Constants";

import {V, Vector} from "Vector";

import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";

import {Port} from "core/models";

import {Component} from "core/models/Component";


/**
 * Renders IOLabels.
 * Check if Component is on screen, quit if not.
 * For each port, align and render name of port at port position.
 */
export const IOLabelRenderer = (() => {

    const drawPortText = function(renderer: Renderer, port: Port, size: Vector): void {
        const align: CanvasTextAlign = "center";
        const textWidth = renderer.getTextWidth(port.getName());

        const pos = port.getOriginPos()
            // Move a padding distance from the origin position
            .add(port.getDir().scale(-IO_LABEL_DIR_PADDING))
            // Move half the text width distance projected onto a horizontal vector
            .add(port.getDir().scale(-textWidth/2).project(V(1,0)))
            // Add in vertical direction so label is a bit farther from port
            .add(port.getDir().scale(-IO_LABEL_VERTICAL_TEXT_PADDING).project(V(0,1)))
            // Flip y-axis
            .scale(V(1, -1));

        // Clamp the position inside the box
        const xBound = size.x/2 - IO_LABEL_DIR_PADDING - textWidth/2;
        const yBound = size.y/2 - 2*IO_LABEL_VERTICAL_TEXT_PADDING;
        /* eslint-disable space-in-parens */
        const min = V(-xBound, -yBound);
        const max = V( xBound,  yBound);
        /* eslint-enable space-in-parens */

        renderer.text(port.getName(), Vector.Clamp(pos, min, max), align);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component): void {
            if (!camera.cull(object.getCullBox()))
                return;

            const size = object.getTransform().getSize();
            object.getPorts().forEach((p) => drawPortText(renderer, p, size));
        },
    };

})();
