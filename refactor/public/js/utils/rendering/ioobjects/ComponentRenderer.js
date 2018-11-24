// @flow
var V = require("../../math/Vector").V;
var Renderer = require("../Renderer");
var IOPortRenderer = require("./IOPortRenderer");
var Camera = require("../../Camera");
var Component = require("../../../models/ioobjects/Component");

var Images = require("../../Images");

// var ANDGate = require("../../../models/ioobjects/gates/ANDGate");
// var Switch = require("../../../models/ioobjects/inputs/Switch");
// var LED = require("../../../models/ioobjects/outputs/LED");

var ComponentRenderer = (function() {
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

            renderer.image(Images.GetImage(object.getImageName()), 0, 0, transform.size.x, transform.size.y);

            renderer.restore();
        }
    };
})();

module.exports = ComponentRenderer;
