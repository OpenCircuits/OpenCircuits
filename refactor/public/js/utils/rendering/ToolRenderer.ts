
import {Renderer} from "./Renderer";
import {Camera} from "../Camera";
import {Tool} from "../tools/Tool";
import {PanTool} from "../tools/PanTool";
import {SelectionTool} from "../tools/SelectionTool";

export var ToolRenderer = (function() {

    return {
        render(renderer: Renderer, camera: Camera, tool: Tool) {

            if (tool instanceof SelectionTool) {
                // Draw selection box
                if (tool.isSelecting()) {
                    // Get positions and size
                    var p1 = tool.getP1();
                    var p2 = tool.getP2();
                    var pos = p1.add(p2).scale(0.5);
                    var size = p2.sub(p1);

                    // Draw box
                    renderer.rect(pos.x, pos.y, size.x, size.y, '#ffffff', '#6666ff', 2 / camera.getZoom(), 0.4);
                }
            }

        }
    };
})();
