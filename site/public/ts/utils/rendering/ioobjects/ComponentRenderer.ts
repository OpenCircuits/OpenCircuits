import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR} from "../../Constants";

import {V} from "../../math/Vector";

import {Renderer} from "../Renderer";
import {IOLabelRenderer} from "./IOLabelRenderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {GateRenderer} from "./gates/GateRenderer";
import {MultiplexerRenderer} from "./other/MultiplexerRenderer";
import {SevenSegmentDisplayRenderer} from "./outputs/SevenSegmentDisplayRenderer";

import {Transform} from "../../math/Transform";
import {Camera} from "../../Camera";
import {Selectable} from "../../Selectable";

import {FlipFlop} from "../../../models/ioobjects/flipflops/FlipFlop";
import {Latch} from "../../../models/ioobjects/latches/Latch";
import {Encoder} from "../../../models/ioobjects/other/Encoder";
import {Decoder} from "../../../models/ioobjects/other/Decoder";
import {Multiplexer} from "../../../models/ioobjects/other/Multiplexer";
import {Demultiplexer} from "../../../models/ioobjects/other/Demultiplexer";
import {Label} from "../../../models/ioobjects/other/Label";
import {Component} from "../../../models/ioobjects/Component";
import {PressableComponent} from "../../../models/ioobjects/PressableComponent";
import {Gate} from "../../../models/ioobjects/gates/Gate";
import {LED} from "../../../models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "../../../models/ioobjects/outputs/SevenSegmentDisplay";
import {IC} from "../../../models/ioobjects/other/IC";

import {Images} from "../../Images";
import {Port} from "../../../models/ports/Port";

import {Rectangle} from "../shapes/Rectangle";
import {Style} from "../Style";

export const ComponentRenderer = (() => {

    const drawBox = function(renderer: Renderer, transform: Transform, selected: boolean): void {
        const borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        const fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        const style = new Style(fillCol, borderCol, DEFAULT_BORDER_WIDTH)
        renderer.draw(new Rectangle(V(), transform.getSize()), style);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component, selected: boolean, selections: Array<Selectable>): void {
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
            else if (object instanceof SevenSegmentDisplay)
                SevenSegmentDisplayRenderer.render(renderer, camera, object, selected);
            else if (object instanceof FlipFlop || object instanceof Latch)
                drawBox(renderer, transform, selected);
            else if (object instanceof Encoder || object instanceof Decoder)
                drawBox(renderer, transform, selected);
            else if (object instanceof IC)
                drawBox(renderer, transform, selected);

            // Draw tinted image
            let tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (object instanceof LED)
                tint = object.getColor();

            if (imgName)
                renderer.image(Images.GetImage(imgName), V(), size, tint);

            // Draw LED turned on
            if (object instanceof LED) {
                if (object.isOn())
                    renderer.image(Images.GetImage(object.getOnImageName()), V(), size.scale(3), object.getColor());
            }

            // Render the IOLabels, does not render labels if they are blank
            IOLabelRenderer.render(renderer, camera, object);

            renderer.restore();
        }
    };
})();
