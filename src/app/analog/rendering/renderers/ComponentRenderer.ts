import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Transform} from "math/Transform";

import {Images} from "core/utils/Images";


import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {IOLabelRenderer} from "core/rendering/renderers/IOLabelRenderer";
import {IOPortRenderer}  from "core/rendering/renderers/IOPortRenderer";

import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Component} from "core/models/Component";

import {AnalogCircuitInfo} from "analog/utils/AnalogCircuitInfo";

import {Label, Oscilloscope} from "analog/models/eeobjects";

import {OscilloscopeRenderer} from "./OscilloscopeRenderer";


/**
 * Renders Components:
 * - Check if object to be rendered is on the screen, quit if not,
 * - Transform renderer to object transform,
 * - Draw all object ports first using IOPortRenderer,
 * - Render IOLabels if not blank,
 * - Restore.
 */
export const ComponentRenderer = (() => {
    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean, fillcol = "#ffffff") {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : fillcol);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }

    return {
        render(renderer: Renderer, info: AnalogCircuitInfo, object: Component): void {
            const { camera, selections } = info;

            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            const selected = selections.has(object);

            renderer.save();

            const transform = object.getTransform();
            const imgName = object.getImageName();

            const size = transform.getSize();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            const ports = object.getPorts();
            for (const port of ports) {
                const portSelected = selections.has(port);
                IOPortRenderer.renderPort(renderer, port, selected, portSelected);
            }

            // Draw label and set the label's size
            //  TODO: figure out how to get around this
            if (object instanceof Label) {
                // Calculate size
                const width = renderer.getTextWidth(object.getName()) + 0.4;
                object.setSize(V(width, size.y));

                drawBox(renderer, object.getTransform(), selected, object.getProp("color") as string);

                renderer.text(object.getName(), V(), "center", object.getProp("textColor") as string);
            }

            // Specific renderers
            if (object instanceof Oscilloscope)
                OscilloscopeRenderer.render(renderer, info, object, selected);

            // Draw tinted image
            const tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (imgName) {
                const img = Images.GetImage(imgName);
                if (!img)
                    throw new Error("ComponentRender.render failed: img is undefined");
                renderer.image(img, V(), size, tint);
            }

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        },
        renderAll(renderer: Renderer, info: AnalogCircuitInfo, objects: Component[]): void {
            for (const obj of objects)
                ComponentRenderer.render(renderer, info, obj);
        },
    };
})();
