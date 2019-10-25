import {V} from "Vector";

import {Renderer} from "core/rendering/Renderer";
import {IOLabelRenderer} from "./IOLabelRenderer";
import {IOPortRenderer} from "./IOPortRenderer";

import {Camera} from "math/Camera";
import {Selectable} from "core/utils/Selectable";

import {Images} from "analog/utils/Images";

import {AnalogComponent} from "analog/models/AnalogComponent";

export const AnalogComponentRenderer = (() => {

    // const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean): void {
    //     const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
    //     const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
    //     const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH)
    //     renderer.draw(new Rectangle(V(), transform.getSize()), style);
    // }

    return {
        render(renderer: Renderer, camera: Camera, object: AnalogComponent, selected: boolean, selections: Selectable[]): void {
            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            renderer.save();

            const transform = object.getTransform();
            const imgName = object.getImageName();

            const size = transform.getSize();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            const ports = object.getPorts();
            for (const port of ports) {
                const portSelected = selections.includes(port);
                IOPortRenderer.renderPort(renderer, port, selected, portSelected);
            }

            if (imgName)
                renderer.image(Images.GetImage(imgName), V(), size);

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        }
    };
})();
