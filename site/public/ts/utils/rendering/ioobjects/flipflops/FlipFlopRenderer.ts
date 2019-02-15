import {DEFAULT_FILL_COLOR,
        DEFAULT_BORDER_COLOR,
        SELECTED_FILL_COLOR,
        SELECTED_BORDER_COLOR,
        DEFAULT_BORDER_WIDTH} from "../../../Constants";
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
        render(renderer: Renderer, camera: Camera, flipflop: FlipFlop, selected: boolean) {
            let transform = flipflop.getTransform();

            let borderCol = (selected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR);
            let fillCol   = (selected ? SELECTED_FILL_COLOR   : DEFAULT_FILL_COLOR);
            renderer.rect(0, 0, transform.getSize().x, transform.getSize().y, fillCol, borderCol, DEFAULT_BORDER_WIDTH);


            IOLabelRenderer.render(renderer, camera, flipflop);
        }
    };
})();
