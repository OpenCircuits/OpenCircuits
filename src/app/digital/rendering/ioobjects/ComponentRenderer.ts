import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR} from "core/utils/Constants";

import {V} from "Vector";
import {Transform} from "math/Transform";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Component}   from "core/models/Component";

import {Renderer}    from "core/rendering/Renderer";
import {Rectangle}   from "core/rendering/shapes/Rectangle";
import {Style}       from "core/rendering/Style";

import {FlipFlop}            from "digital/models/ioobjects/flipflops/FlipFlop";
import {Latch}               from "digital/models/ioobjects/latches/Latch";
import {Encoder}             from "digital/models/ioobjects/other/Encoder";
import {Decoder}             from "digital/models/ioobjects/other/Decoder";
import {Multiplexer}         from "digital/models/ioobjects/other/Multiplexer";
import {Demultiplexer}       from "digital/models/ioobjects/other/Demultiplexer";
import {Label}               from "digital/models/ioobjects/other/Label";
import {PressableComponent}  from "digital/models/ioobjects/PressableComponent";
import {Gate}                from "digital/models/ioobjects/gates/Gate";
import {LED}                 from "digital/models/ioobjects/outputs/LED";
import {SegmentDisplay}      from "digital/models/ioobjects/outputs/SegmentDisplay";
import {IC}                  from "digital/models/ioobjects/other/IC";

import {Images} from "digital/utils/Images";

import {IOLabelRenderer} from "./IOLabelRenderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {MultiplexerRenderer} from "./other/MultiplexerRenderer";
import {ICRenderer}  from "./other/ICRenderer";
import {GateRenderer} from "./gates/GateRenderer";
import {LEDRenderer} from "./outputs/LEDRenderer";
import {SegmentDisplayRenderer} from "./outputs/SegmentDisplayRenderer";


export const ComponentRenderer = (() => {

    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean, fillcol: string = "#ffffff"): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : fillcol);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }

    return {
        render(renderer: Renderer, {camera, selections}: CircuitInfo, object: Component): void {
            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            const selected = selections.has(object);

            renderer.save();

            const transform = object.getTransform();
            const imgName = object.getImageName();

            let size = transform.getSize();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            const ports = object.getPorts();
            for (const port of ports) {
                const portSelected = selections.has(port);
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
                object.setSize(V(width, size.y));

                drawBox(renderer, object.getTransform(), selected, object.getColor());

                renderer.text(object.getName(), V(), "center", object.getTextColor());
            }

            // Specific renderers
            if (object instanceof Gate)
                GateRenderer.render(renderer, camera, object, selected);
            else if (object instanceof Multiplexer || object instanceof Demultiplexer)
                MultiplexerRenderer.render(renderer, camera, object, selected);
            else if (object instanceof SegmentDisplay)
                SegmentDisplayRenderer.render(renderer, camera, object, selected);
            else if (object instanceof IC)
                ICRenderer.render(renderer, camera, object, selected);
            else if (object instanceof FlipFlop || object instanceof Latch)
                drawBox(renderer, transform, selected);
            else if (object instanceof Encoder || object instanceof Decoder)
                drawBox(renderer, transform, selected);

            // Draw tinted image
            const tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (object instanceof LED) {
                LEDRenderer.render(renderer, camera, object, selected);
            }
            else if (imgName) {
                renderer.image(Images.GetImage(imgName), V(), size, tint);
            }

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        },
        renderAll(renderer: Renderer, info: CircuitInfo, objects: Component[]): void {
            for (const obj of objects)
                ComponentRenderer.render(renderer, info, obj);
        }
    };
})();
