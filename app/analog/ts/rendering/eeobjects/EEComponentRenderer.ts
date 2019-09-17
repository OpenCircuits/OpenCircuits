import {DEBUG_SHOW_CULLBOXES,
        DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR} from "../../Constants";

import {V} from "../../math/Vector";

import {Renderer} from "../Renderer";
import {IOLabelRenderer} from "./IOLabelRenderer";
import {EEPortRenderer} from "./EEPortRenderer";

import {Transform} from "../../math/Transform";
import {Camera} from "../../Camera";

import {EEComponent} from "../../../models/eeobjects/EEComponent";

import {Images} from "../../Images";
import {EEPort} from "../../../models/eeobjects/EEPort";

export const EEComponentRenderer = (function() {

    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean) {
        let borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        let fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        renderer.rect(0, 0, transform.getSize().x, transform.getSize().y, fillCol, borderCol, DEFAULT_BORDER_WIDTH);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: EEComponent, selected: boolean, selectedPorts: Array<EEPort>) {
            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            renderer.save();

            let transform = object.getTransform();
            let imgName = object.getImageName();

            let size = transform.getSize();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            const ports = object.getPorts();
            for (const port of ports) {
                const portSelected = selectedPorts.includes(port);
                EEPortRenderer.renderPort(renderer, port, selected, portSelected);
            }

            // Draw tinted image
            let tint = (selected ? SELECTED_FILL_COLOR : undefined);

            if (imgName)
                renderer.image(Images.GetImage(imgName), 0, 0, size.x, size.y, tint);

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();

            if (DEBUG_SHOW_CULLBOXES) {
                renderer.save();
                let cullBox = object.getCullBox();
                renderer.transform(camera, cullBox);
                renderer.rect(0, 0, cullBox.getSize().x, cullBox.getSize().y, '#ff00ff', '#000000', 0, 0.5);
                renderer.restore();
            }
        }
    };
})();
