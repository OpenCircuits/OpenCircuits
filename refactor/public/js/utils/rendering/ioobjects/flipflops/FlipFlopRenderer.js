// @flow
var V = require("../../../math/Vector").V;
var Renderer = require("../../Renderer");
var Camera = require("../../../Camera");
var FlipFlop = require("../../../../models/ioobjects/flipflops/FlipFlop");
var ComponentRenderer = require("../ComponentRenderer");

var Images = require("../../../Images");

// var ANDGate = require("../../../models/ioobjects/gates/ANDGate");
// var Switch = require("../../../models/ioobjects/inputs/Switch");
// var LED = require("../../../models/ioobjects/outputs/LED");

var FlipFlopRenderer = (function() {
    var images = [];

    return {
        render(renderer: Renderer, camera: Camera, flipflop: FlipFlop, selected: boolean) {
            ComponentRenderer.render(renderer, camera, flipflop, selected);

            renderer.save();

            var transform = flipflop.getTransform();

            renderer.transform(camera, transform);





            renderer.restore();
        }
    };
})();

module.exports = FlipFlopRenderer;
