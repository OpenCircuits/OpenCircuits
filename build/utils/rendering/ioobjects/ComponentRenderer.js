"use strict";

var V = require("../../math/Vector").V;
var Renderer = require("../Renderer");
var Camera = require("../../Camera");
var Component = require("../../../models/ioobjects/Component");

var Images = require("../../Images");

var ANDGate = require("../../../models/ioobjects/gates/ANDGate");
var Switch = require("../../../models/ioobjects/inputs/Switch");
var LED = require("../../../models/ioobjects/outputs/LED");

var ComponentRenderer = function () {
    var images = [];

    return {
        render(renderer, camera, object) {
            renderer.save();

            var transform = object.getTransform();

            renderer.transform(camera, transform);

            // for (var i = 0; i < this.inputs.length; i++)
            //     this.inputs[i].draw();
            // 
            // for (var i = 0; i < this.outputs.length; i++)
            //     this.outputs[i].draw(i);

            // if (this.isPressable && this.selectionBoxTransform != undefined)
            //     renderer.rect(0, 0, this.selectionBoxTransform.size.x, this.selectionBoxTransform.size.y, this.getCol(), this.getBorderColor());

            renderer.image(Images.GetImage(object.getImageName()), 0, 0, transform.size.x, transform.size.y);

            renderer.restore();
        }
    };
}();

module.exports = ComponentRenderer;