import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";
import {FlipFlop} from "../../../../models/ioobjects/flipflops/FlipFlop";
import {IOLabelRenderer} from "../IOLabelRenderer";

// import {Images} from "../../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var FlipFlopRenderer = (function() {
    return {
        render(renderer: Renderer, camera: Camera, flipflop: FlipFlop) {

            IOLabelRenderer.render(renderer, camera, flipflop);

            renderer.save();

            var transform = flipflop.getTransform();

            renderer.transform(camera, transform);

            renderer.restore();
        }
    };
})();
