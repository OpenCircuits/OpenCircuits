import {Vector,V} from "../../math/Vector";
import {Renderer} from "../Renderer";
import {IOPortRenderer} from "./IOPortRenderer";
import {Camera} from "../../Camera";
import {Component} from "../../../models/ioobjects/Component";

import {Images} from "../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var ComponentRenderer = (function() {
    var images = [];

    return {
        render(renderer: Renderer, camera: Camera, object: Component, selected: boolean) {
            renderer.save();

            var transform = object.getTransform();

            renderer.transform(camera, transform);

            for (var i = 0; i < object.getInputPortCount(); i++)
                IOPortRenderer.renderIPort(renderer, camera, object.getInputPort(i),  selected);

            for (var i = 0; i < object.getOutputPortCount(); i++)
                IOPortRenderer.renderOPort(renderer, camera, object.getOutputPort(i), selected);

            // if (this.isPressable && this.selectionBoxTransform != undefined)
            //     renderer.rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());

            renderer.image(Images.GetImage(object.getImageName()), 0, 0, transform.getSize().x, transform.getSize().y);

            renderer.restore();
        }
    };
})();
