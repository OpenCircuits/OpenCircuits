import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR} from "../../Constants";

import {Renderer} from "../Renderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {Camera} from "../../Camera";
import {Component} from "../../../models/ioobjects/Component";
import {PressableComponent} from "../../../models/ioobjects/PressableComponent";

import {Images} from "../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var ComponentRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, object: Component, selected: boolean) {
            renderer.save();

            let transform = object.getTransform();
            let imgName = object.getImageName();

            // Transform the renderer
            renderer.transform(camera, transform);

            // Draw IO ports
            for (let i = 0; i < object.getInputPortCount(); i++)
                IOPortRenderer.renderIPort(renderer, object.getInputPort(i),  selected);

            for (let i = 0; i < object.getOutputPortCount(); i++)
                IOPortRenderer.renderOPort(renderer, object.getOutputPort(i), selected);

            // Draw background box for pressable components
            if (object instanceof PressableComponent) {
                if (object.isOn())
                    imgName = object.getOnImageName();

                let box = object.getSelectionBox();
                let borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
                let fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
                renderer.rect(box.getPos().x, box.getPos().y, box.getSize().x, box.getSize().y, fillCol, borderCol, 2);
            }

            // Draw tinted image
            let tint = (selected ? SELECTED_FILL_COLOR : undefined);
            renderer.image(Images.GetImage(imgName), 0, 0, transform.getSize().x, transform.getSize().y, tint);

            renderer.restore();
        }
    };
})();
