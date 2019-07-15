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
import {Selectable} from "../../../../../site/public/ts/utils/Selectable";
import {ANDGate} from "../../../../../site/public/ts/models/ioobjects/gates/ANDGate";
import {Switch} from "../../../../../site/public/ts/models/ioobjects/inputs/Switch";
import {LED} from "../../../../../site/public/ts/models/ioobjects/outputs/LED";

import {FakeInput} from "../FakeInput";
import {InitializeInput} from "./Helpers";

describe("Tool Manager", () => {
    const camera = new Camera(500, 500);
    const center = camera.getCenter();

    const designer = new CircuitDesigner(-1);
    const toolManager = new ToolManager(camera, designer);
    const input = new FakeInput();

    InitializeInput(input, toolManager);

    function tool(): Tool {
        return toolManager.getCurrentTool();
    }

    describe("Click Switch, Wire Switch -> LED, Select All then Rotate", () => {
        const s = new Switch();
        const l = new LED();
        l.setPos(V(200, 0));

        designer.addObjects([s, l]);

        const lPortPos = l.getInputPort(0).getWorldTargetPos();
        const sPortPos = s.getOutputPort(0).getWorldTargetPos();

        expect(tool()).toBeInstanceOf(SelectionTool);

        test("Click Switch", () => {
            input.click(center);
            expect(tool()).toBeInstanceOf(SelectionTool);
        });

        test("Wire Switch -> LED", () => {
            input.click(sPortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            input.click(lPortPos);
            expect(tool()).toBeInstanceOf(SelectionTool);
        });

        test("Select All", () => {
            input.drag(center.add(V(-100, 100)),
                       center.add(V(300, 300)));
            expect(tool()).toBeInstanceOf(SelectionTool);
        });

        test("Rotate All", () => {
            const midpoint = s.getPos().add(l.getPos()).scale(0.5);
            input.moveTo(center.add(midpoint))
                    .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                    .press();
            expect(tool()).toBeInstanceOf(RotateTool);
            input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                    .release();
        });

        expect(tool()).toBeInstanceOf(SelectionTool);
    });

    // Reset designer
    designer.reset();

    describe ("Wire Switches to ANDGate, then ANDGate to LED, then turn them On", () => {
        const s1 = new Switch();
        const s2 = new Switch();
        const l  = new LED();
        const a  = new ANDGate();
        s1.setPos(V(-200, -50));
        s2.setPos(V(-200, 50));
        l.setPos(V(200, 0));
        a.setPos(V(0, 0));

        designer.addObjects([s1, s2, l, a]);

        const lPortPos  = l.getInputPort(0).getWorldTargetPos();
        const s1PortPos = s1.getOutputPort(0).getWorldTargetPos();
        const s2PortPos = s2.getOutputPort(0).getWorldTargetPos();
        const aOutPos   = a.getOutputPort(0).getWorldTargetPos();
        const aIn1Pos   = a.getInputPort(0).getWorldTargetPos();
        const aIn2Pos   = a.getInputPort(1).getWorldTargetPos();

        expect(tool()).toBeInstanceOf(SelectionTool);

        test("Wire Switches -> ANDGate", () => {
            input.click(s1PortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            input.click(aIn1Pos);
            expect(tool()).toBeInstanceOf(SelectionTool);

            input.click(s2PortPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            input.click(aIn2Pos);
            expect(tool()).toBeInstanceOf(SelectionTool);
        });

        test("Wire ANDGate -> LED", () => {
            input.click(aOutPos);
            expect(tool()).toBeInstanceOf(WiringTool);
            input.click(lPortPos);
            expect(tool()).toBeInstanceOf(SelectionTool);
        });

        test("Turn on Switches", () => {
            input.click(s1.getPos());
            expect(tool()).toBeInstanceOf(SelectionTool);
            input.click(s2.getPos());
            expect(tool()).toBeInstanceOf(SelectionTool);

            expect(l.isOn());
        });
    });
});
