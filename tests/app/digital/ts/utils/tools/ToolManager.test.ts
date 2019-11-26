import "jest";

import {ROTATION_CIRCLE_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import {Camera} from "math/Camera";

import {Tool}          from "core/tools/Tool";
import {SelectionTool} from "core/tools/SelectionTool";
import {RotateTool}    from "core/tools/RotateTool";
import {ToolManager}   from "core/tools/ToolManager";
import {WiringTool}    from "core/tools/WiringTool";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {FakeInput} from "../FakeInput";
import {InitializeInput, CreateDefaultToolManager} from "test/helpers/ToolHelpers";

import {Place} from "test/helpers/Helpers";

describe("Tool Manager", () => {
    const camera = new Camera(500, 500);
    const designer = new DigitalCircuitDesigner(-1);
    const toolManager = CreateDefaultToolManager(designer, camera);
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

        Place(designer, [s, l]);

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

        Place(designer, [s1, s2, a, l]);

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
