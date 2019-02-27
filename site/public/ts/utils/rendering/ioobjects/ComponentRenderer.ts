import {DEBUG_SHOW_CULLBOXES,
        DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR} from "../../Constants";

import {Renderer} from "../Renderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {GateRenderer} from "./gates/GateRenderer";
import {FlipFlopRenderer} from "./flipflops/FlipFlopRenderer";
import {ICRenderer} from "./other/ICRenderer";

import {Transform} from "../../math/Transform";
import {Camera} from "../../Camera";

import {FlipFlop} from "../../../models/ioobjects/flipflops/FlipFlop";
import {Component} from "../../../models/ioobjects/Component";
import {PressableComponent} from "../../../models/ioobjects/PressableComponent";
import {Gate} from "../../../models/ioobjects/gates/Gate";
import {LED} from "../../../models/ioobjects/outputs/LED";
import {SevenSegmentDisplay} from "../../../models/ioobjects/outputs/SevenSegmentDisplay";
import {IC} from "../../../models/ioobjects/other/IC";

import {Images} from "../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var ComponentRenderer = (function() {

    let drawBox = function(renderer: Renderer, transform: Transform, selected: boolean) {
        let borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
        let fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
        renderer.rect(0, 0, transform.getSize().x, transform.getSize().y, fillCol, borderCol, DEFAULT_BORDER_WIDTH);
    }

    return {
        render(renderer: Renderer, camera: Camera, object: Component, selected: boolean) {
            // Check if object is on the screen
            if (!camera.cull(object.getCullBox()))
                return;

            renderer.save();

            let transform = object.getTransform();
            let imgName = object.getImageName();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            for (let i = 0; i < object.getInputPortCount(); i++)
                IOPortRenderer.renderIPort(renderer, object.getInputPort(i), selected);

            for (let i = 0; i < object.getOutputPortCount(); i++)
                IOPortRenderer.renderOPort(renderer, object.getOutputPort(i), selected);

            // Draw background box for pressable components
            if (object instanceof PressableComponent) {
                if (object.isOn())
                    imgName = object.getOnImageName();

                let box = object.getSelectionBox();
                drawBox(renderer, box, selected);
            }
            if (object instanceof FlipFlop) {
                FlipFlopRenderer.render(renderer, camera, object, selected);
            }

            // Specific renderers
            if (object instanceof Gate)
                GateRenderer.render(renderer, camera, object, selected);
            if (object instanceof FlipFlop)
                FlipFlopRenderer.render(renderer, camera, object, selected);
            if (object instanceof IC)
                ICRenderer.render(renderer, camera, object, selected);
            if (object instanceof SevenSegmentDisplay)
                drawBox(renderer, transform, selected);

            // Draw tinted image
            let tint = (selected ? SELECTED_FILL_COLOR : undefined);
            if (object instanceof LED)
                tint = object.getColor();

            if (Images.GetImage(imgName))
                renderer.image(Images.GetImage(imgName), 0, 0, transform.getSize().x, transform.getSize().y, tint);

            // Draw LED turned on
            if (object instanceof LED) {
                if (object.isOn()) {
                    renderer.image(Images.GetImage(object.getOnImageName()), 0, 0, 3*transform.getSize().x, 3*transform.getSize().y, object.getColor());
                }
            }

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
