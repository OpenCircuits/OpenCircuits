import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        LED_GLOW_SIZE} from "core/utils/Constants";

import {V} from "Vector";
import {Transform} from "math/Transform";
import {Camera} from "math/Camera";

import {Renderer} from "core/rendering/Renderer";

import {Selectable} from "core/utils/Selectable";

import {IOLabelRenderer} from "./IOLabelRenderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {GateRenderer} from "./gates/GateRenderer";
import {MultiplexerRenderer} from "./other/MultiplexerRenderer";
import {SegmentDisplayRenderer} from "./outputs/SegmentDisplayRenderer";

import {FlipFlop}            from "digital/models/ioobjects/flipflops/FlipFlop";
import {Latch}               from "digital/models/ioobjects/latches/Latch";
import {Encoder}             from "digital/models/ioobjects/other/Encoder";
import {Decoder}             from "digital/models/ioobjects/other/Decoder";
import {Multiplexer}         from "digital/models/ioobjects/other/Multiplexer";
import {Demultiplexer}       from "digital/models/ioobjects/other/Demultiplexer";
import {Label}               from "digital/models/ioobjects/other/Label";
import {Component}           from "core/models/Component";
import {PressableComponent}  from "digital/models/ioobjects/PressableComponent";
import {Gate}                from "digital/models/ioobjects/gates/Gate";
import {LED}                 from "digital/models/ioobjects/outputs/LED";
import {SegmentDisplay} from "digital/models/ioobjects/outputs/SegmentDisplay";
import {IC}                  from "digital/models/ioobjects/other/IC";

import {Images} from "digital/utils/Images";

import {Rectangle} from "../../../../core/ts/rendering/shapes/Rectangle";
import {Style} from "../../../../core/ts/rendering/Style";

export const ComponentRenderer = (() => {

    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH)
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component, selected: boolean, selections: Selectable[]): void {
            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            renderer.save();

            const transform = object.getTransform();
            const imgName = object.getImageName();

            let size = transform.getSize();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            const ports = object.getPorts();
            for (const port of ports) {
                const portSelected = selections.includes(port);
                IOPortRenderer.renderPort(renderer, port, selected, portSelected);
            }

            // Draw background box for pressable components
            if (object instanceof PressableComponent) {
                // Set size/pos for drawing image to be size of "pressable" part
                size = object.getPressableBox().getSize();

                const box = transform;
                drawBox(renderer, box, selected);
            }

            // Draw label and set the label's size
            //  TODO: figure out how to get around this
            if (object instanceof Label) {
                // Calculate size
                const width = renderer.getTextWidth(object.getName()) + 20;
                transform.setSize(V(width, size.y));

                drawBox(renderer, transform, selected);

                renderer.text(object.getName(), V(), "center");
            }

            // Specific renderers
            if (object instanceof Gate)
                GateRenderer.render(renderer, camera, object, selected);
            else if (object instanceof Multiplexer || object instanceof Demultiplexer)
                MultiplexerRenderer.render(renderer, camera, object, selected);
            else if (object instanceof SegmentDisplay)
                SegmentDisplayRenderer.render(renderer, camera, object, selected);
            else if (object instanceof FlipFlop || object instanceof Latch)
                drawBox(renderer, transform, selected);
            else if (object instanceof Encoder || object instanceof Decoder)
                drawBox(renderer, transform, selected);
            else if (object instanceof IC)
                drawBox(renderer, transform, selected);

            // Draw tinted image
            const tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (object instanceof LED) {
                // draw the LED object
                renderer.image(Images.GetImage(imgName), V(), size, object.getColor());

                // draw the LED glow
                if (object.isOn()) {
                    const glowImg = Images.GetImage(object.getOnImageName());
                    renderer.image(glowImg, V(), V(LED_GLOW_SIZE), object.getColor());
                }

                // tint green on top if selected
                if (tint)
                    renderer.overlayTint(Images.GetImage(imgName), V(), size, tint);
            }
            else if (imgName) {
                renderer.image(Images.GetImage(imgName), V(), size, tint);
            }

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        }
    };
})();
