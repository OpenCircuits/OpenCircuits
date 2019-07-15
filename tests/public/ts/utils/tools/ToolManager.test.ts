import "jest";

import {ROTATION_CIRCLE_RADIUS} from "../../../../../site/public/ts/utils/Constants";

import {V} from "../../../../../site/public/ts/utils/math/Vector";

import {Camera} from "../../../../../site/public/ts/utils/Camera";

import {Tool} from "../../../../../site/public/ts/utils/tools/Tool";
import {ToolManager} from "../../../../../site/public/ts/utils/tools/ToolManager";
import {SelectionTool} from "../../../../../site/public/ts/utils/tools/SelectionTool";
import {RotateTool} from "../../../../../site/public/ts/utils/tools/RotateTool";
import {WiringTool} from "../../../../../site/public/ts/utils/tools/WiringTool";

import {CircuitDesigner} from "../../../../../site/public/ts/models/CircuitDesigner";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Tool Manager", () => {
    const camera = new Camera(500, 500);
    const designer = new CircuitDesigner(-1);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput(camera.getCenter());

    InitializeInput(input, toolManager);

    function tool(): Tool {
        return toolManager.getCurrentTool();
    }

    afterEach(() => {
        // Reset circuit
        designer.reset();
    })

    test("Click Switch, Wire Switch -> LED, Select All then Rotate", () => {
        const s = new Switch();
        const l = new LED();
        l.setPos(V(200, 0));

        designer.addObjects([s, l]);

        const lPortPos = l.getInputPort(0).getWorldTargetPos();
        const sPortPos = s.getOutputPort(0).getWorldTargetPos();

        expect(tool()).toBeInstanceOf(SelectionTool);

        // Click Switch
        input.click(V(0, 0));
        expect(tool()).toBeInstanceOf(SelectionTool);

        // Wire Switch -> LED
        input.click(sPortPos);
        expect(tool()).toBeInstanceOf(WiringTool);
        input.click(lPortPos);
        expect(tool()).toBeInstanceOf(SelectionTool);

        // Select All
        input.drag(V(-100, -100),
                   V(300, 300));
        expect(tool()).toBeInstanceOf(SelectionTool);

        // Rotate All
        const midpoint = s.getPos().add(l.getPos()).scale(0.5);
        input.moveTo(midpoint)
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press();
        expect(tool()).toBeInstanceOf(RotateTool);
        input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release();

        expect(tool()).toBeInstanceOf(SelectionTool);
    });

    test("Wire Switches to ANDGate, then ANDGate to LED, then turn them On", () => {
        const s1 = new Switch();
        const s2 = new Switch();
        const a  = new ANDGate();
        const l  = new LED();
        s1.setPos(V(-200, -50));
        s2.setPos(V(-200, 50));
        a.setPos(V(0, 0));
        l.setPos(V(200, 0));

        designer.addObjects([s1, s2, a, l]);

        const s1PortPos = s1.getOutputPort(0).getWorldTargetPos();
        const s2PortPos = s2.getOutputPort(0).getWorldTargetPos();
        const aOutPos   = a.getOutputPort(0).getWorldTargetPos();
        const aIn1Pos   = a.getInputPort(0).getWorldTargetPos();
        const aIn2Pos   = a.getInputPort(1).getWorldTargetPos();
        const lPortPos  = l.getInputPort(0).getWorldTargetPos();

        expect(tool()).toBeInstanceOf(SelectionTool);

        // Wire ANDGate -> LED
        input.click(aOutPos);
        expect(tool()).toBeInstanceOf(WiringTool);
        input.click(lPortPos);
        expect(tool()).toBeInstanceOf(SelectionTool);

        // Wire Switches -> ANDGate
        input.click(s1PortPos);
        expect(tool()).toBeInstanceOf(WiringTool);
        input.click(aIn1Pos);
        expect(tool()).toBeInstanceOf(SelectionTool);

        input.click(s2PortPos);
        expect(tool()).toBeInstanceOf(WiringTool);
        input.click(aIn2Pos);
        expect(tool()).toBeInstanceOf(SelectionTool);

        // Turn on Switches
        input.click(s1.getPos());
        expect(tool()).toBeInstanceOf(SelectionTool);
        input.click(s2.getPos());
        expect(tool()).toBeInstanceOf(SelectionTool);

        expect(l.isOn());
    });
});
