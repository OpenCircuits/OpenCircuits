import "jest";

import {LEFT_MOUSE_BUTTON,
        ROTATION_CIRCLE_RADIUS} from "../../../../../site/public/ts/utils/Constants";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {Camera} from "../../../../../site/public/ts/utils/Camera";
import {Input} from "../../../../../site/public/ts/utils/Input";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {RotateTool} from "../../../../../site/public/ts/utils/tools/RotateTool";
import {SelectionTool} from "../../../../../site/public/ts/utils/tools/SelectionTool";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {V} from "../../../../../site/public/ts/utils/math/Vector";

describe("Rotate Tool", () => {
    let camera = new Camera(500, 500);
    let designer = new CircuitDesigner(0);
    let toolManager = new ToolManager(camera, designer);

    // Declare as type: any so that we can manipulate
    //  private methods to simulate user input
    let input: any = new Input(<any>{
        addEventListener:() => {},
        getBoundingClientRect:() => {return {left: 0, top: 0}}
    }, -1);

    input.addListener("keydown", (b?: number) => { toolManager.onKeyDown(input, b); });
    input.addListener("keyup",   (b?: number) => { toolManager.onKeyUp(input, b); });
    input.addListener("mousedown", (b?: number) => { toolManager.onMouseDown(input, b); });
    input.addListener("mousemove", () => { toolManager.onMouseMove(input); });
    input.addListener("mousedrag", (b?: number) => { toolManager.onMouseDrag(input, b); });
    input.addListener("mouseup",   (b?: number) => { toolManager.onMouseUp(input, b); });
    input.addListener("click",   (b?: number) => { toolManager.onClick(input, b); });

    let center = camera.getCenter();

    var l = new ANDGate();
    designer.addObject(l);
    l.setPos(V(0,0));
    it("Rotate an object from 3rd quadrant", () => {
        let pos = l.getAngle();

        input.onMouseDown({clientX: center.x, clientY: center.y});
        input.onMouseUp({clientX: center.x, clientY: center.y});
        input.onClick({clientX: center.x, clientY: center.y, button: LEFT_MOUSE_BUTTON});

        input.onMouseMove({clientX: center.x-ROTATION_CIRCLE_RADIUS, clientY: center.y});
        input.onMouseDown({clientX: center.x-ROTATION_CIRCLE_RADIUS, clientY: center.y});
        input.onMouseMove({clientX: center.x, clientY: center.y+ROTATION_CIRCLE_RADIUS});
        input.onMouseUp({clientX: center.x, clientY: center.y+ROTATION_CIRCLE_RADIUS});

        let pos2 = l.getAngle();

        // Expect rotation
        expect(pos2).not.toEqual(pos);
    });
    it("Rotate an object from 4th quadrant", () => {
      let pos = l.getAngle();

      input.onMouseDown({clientX: center.x, clientY: center.y});
      input.onMouseUp({clientX: center.x, clientY: center.y});
      input.onClick({clientX: center.x, clientY: center.y, button: LEFT_MOUSE_BUTTON});

      input.onMouseMove({clientX: center.x+ROTATION_CIRCLE_RADIUS, clientY: center.y});
      input.onMouseDown({clientX: center.x+ROTATION_CIRCLE_RADIUS, clientY: center.y});
      input.onMouseMove({clientX: center.x, clientY: center.y+ROTATION_CIRCLE_RADIUS});
      input.onMouseUp({clientX: center.x, clientY: center.y+ROTATION_CIRCLE_RADIUS});

      let pos2 = l.getAngle();

      // Expect rotation
      expect(pos2).not.toEqual(pos);
    });
});
