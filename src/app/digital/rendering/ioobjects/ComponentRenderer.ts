import {DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_BORDER_COLOR,
        SELECTED_FILL_COLOR} from "core/utils/Constants";

import {V} from "Vector";

import {Transform} from "math/Transform";

import {CircuitInfo} from "core/utils/CircuitInfo";
import {Images}      from "core/utils/Images";

import {Renderer} from "core/rendering/Renderer";
import {Style}    from "core/rendering/Style";

import {IOLabelRenderer} from "core/rendering/renderers/IOLabelRenderer";
import {IOPortRenderer}  from "core/rendering/renderers/IOPortRenderer";

import {Rectangle} from "core/rendering/shapes/Rectangle";

import {Component} from "core/models/Component";

import {PressableComponent} from "digital/models/ioobjects/PressableComponent";

import {FlipFlop} from "digital/models/ioobjects/flipflops/FlipFlop";

import {Gate} from "digital/models/ioobjects/gates/Gate";

import {ConstantNumber} from "digital/models/ioobjects/inputs/ConstantNumber";

import {Latch} from "digital/models/ioobjects/latches/Latch";

import {Comparator}    from "digital/models/ioobjects/other/Comparator";
import {Decoder}       from "digital/models/ioobjects/other/Decoder";
import {Demultiplexer} from "digital/models/ioobjects/other/Demultiplexer";
import {Encoder}       from "digital/models/ioobjects/other/Encoder";
import {IC}            from "digital/models/ioobjects/other/IC";
import {Label}         from "digital/models/ioobjects/other/Label";
import {Multiplexer}   from "digital/models/ioobjects/other/Multiplexer";

import {LED}            from "digital/models/ioobjects/outputs/LED";
import {Oscilloscope}   from "digital/models/ioobjects/outputs/Oscilloscope";
import {SegmentDisplay} from "digital/models/ioobjects/outputs/SegmentDisplay";

import {GateRenderer}           from "./gates/GateRenderer";
import {ConstantNumberRenderer} from "./inputs/ConstantNumberRenderer";
import {ICRenderer}             from "./other/ICRenderer";
import {MultiplexerRenderer}    from "./other/MultiplexerRenderer";
import {LEDRenderer}            from "./outputs/LEDRenderer";
import {OscilloscopeRenderer}   from "./outputs/OscilloscopeRenderer";
import {SegmentDisplayRenderer} from "./outputs/SegmentDisplayRenderer";


/**
 * Renders Components:
 * - Check if object to be rendered is on the screen, quit if not
 * - Transform renderer to object transform
 * - Draw all object ports first using IOPortRenderer
 * - If object is PressableComponent or Label, handle special case to draw each
 * - If object is FlipFlop, Latch, Encoder, or Decoder, use drawBox func to draw
 * - Else if object is a Gate, Multiplexer/Demultiplexer, SegmentDisplay, IC, or LED call upon
 * - respective renderers to draw
 * - LEDs are not tinted regardless of selection status, but for others, determine whether selected
 * - and tint appropriately
 * - Render IOLabels if not blank
 * - Restore the renderer.
 */
export const ComponentRenderer = (() => {

    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean, fillcol = "#ffffff"): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : fillcol);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH);
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }

    return {
        render(renderer: Renderer, { camera, selections }: CircuitInfo, object: Component): void {
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
                const width = renderer.getTextWidth(object.getName()) + 0.4;
                object.setSize(V(width, size.y));

                drawBox(renderer, object.getTransform(), selected, object.getProp("color") as string);

                renderer.text(object.getName(), V(), "center", object.getProp("textColor") as string);
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
            else if (object instanceof Comparator)
                drawBox(renderer, transform, selected);
            else if (object instanceof ConstantNumber)
                ConstantNumberRenderer.render(renderer, object, selected);
            else if (object instanceof Oscilloscope)
                OscilloscopeRenderer.render(renderer, camera, object, selected);

            // Draw tinted image
            const tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (object instanceof LED) {
                LEDRenderer.render(renderer, camera, object, selected);
            }
            else if (imgName) {
                const img = Images.GetImage(imgName);
                if (!img)
                    throw new Error("ComponentRender.render failed: img is undefined");
                renderer.image(img, V(), size, tint);
            }

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        },
        renderAll(renderer: Renderer, info: CircuitInfo, objects: Component[]): void {
            for (const obj of objects)
                ComponentRenderer.render(renderer, info, obj);
        },
    };
})();
