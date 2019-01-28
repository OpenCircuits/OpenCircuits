import {Renderer} from "../../Renderer";
import {Camera} from "../../../Camera";
import {FlipFlop} from "../../../../models/ioobjects/flipflops/FlipFlop";
import {ComponentRenderer} from "../ComponentRenderer";

// import {Images} from "../../../Images";

// import {ANDGate} from "../../../models/ioobjects/gates/ANDGate";
// import {Switch} from "../../../models/ioobjects/inputs/Switch";
// import {LED} from "../../../models/ioobjects/outputs/LED";

export var FlipFlopRenderer = (function() {
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
