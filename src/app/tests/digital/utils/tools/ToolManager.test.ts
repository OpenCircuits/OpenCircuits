import {ROTATION_CIRCLE_RADIUS} from "core/utils/Constants";

import {V} from "Vector";

import "test/helpers/Extensions";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup}      from "test/helpers/Setup";

import {DefaultTool} from "core/tools/DefaultTool";
import {RotateTool}  from "core/tools/RotateTool";
import {Tool}        from "core/tools/Tool";
import {WiringTool}  from "core/tools/WiringTool";

import {ANDGate, LED, Switch} from "digital/models/ioobjects";



describe("Tool Manager", () => {
    const { designer, input, toolManager } = Setup();
    const { Place, AutoPlace } = GetHelpers(designer);

    const defaultTool = toolManager.getCurrentTool() as DefaultTool;


    function tool(): Tool | DefaultTool {
        return toolManager.getCurrentTool();
    }

    afterEach(() => {
        // Reset circuit
        designer.reset();
    })

    test("Click Switch, Wire Switch -> LED, Select All then Rotate", () => {
        const [s, l] = Place(new Switch(), new LED());
        l.setPos(V(200, 0));

        const lPortPos = l.getInputPort(0).getWorldTargetPos();
        const sPortPos = s.getOutputPort(0).getWorldTargetPos();

        expect(tool()).toBe(defaultTool);

        // Click Switch
        input.click(V(0, 0));
        expect(tool()).toBe(defaultTool);

        // Wire Switch -> LED
        input.click(sPortPos);
        expect(tool()).toBe(WiringTool);
        input.click(lPortPos);
        expect(tool()).toBe(defaultTool);

        // Select All
        input.drag(V(-100, -100),
                   V(300, 300));
        expect(tool()).toBe(defaultTool);

        // Rotate All
        const midpoint = s.getPos().add(l.getPos()).scale(0.5);
        input.moveTo(midpoint)
                .move(V(-ROTATION_CIRCLE_RADIUS, 0))
                .press();
        expect(tool()).toBe(RotateTool);
        input.move(V(0, +ROTATION_CIRCLE_RADIUS))
                .release();

        expect(tool()).toBe(defaultTool);
    });

    test("Wire Switches to ANDGate, then ANDGate to LED, then turn them On", () => {
        const [a, [s1, s2], [l]] = AutoPlace(new ANDGate());
        s1.setPos(V(-200, -50));
        s2.setPos(V(-200, 50));
        a.setPos(V(0, 0));
        l.setPos(V(200, 0));

        const s1PortPos = s1.getOutputPort(0).getWorldTargetPos();
        const s2PortPos = s2.getOutputPort(0).getWorldTargetPos();
        const aOutPos   = a.getOutputPort(0).getWorldTargetPos();
        const aIn1Pos   = a.getInputPort(0).getWorldTargetPos();
        const aIn2Pos   = a.getInputPort(1).getWorldTargetPos();
        const lPortPos  = l.getInputPort(0).getWorldTargetPos();

        expect(tool()).toBe(defaultTool);

        // Wire ANDGate -> LED
        input.click(aOutPos);
        expect(tool()).toBe(WiringTool);
        input.click(lPortPos);
        expect(tool()).toBe(defaultTool);

        // Wire Switches -> ANDGate
        input.click(s1PortPos);
        expect(tool()).toBe(WiringTool);
        input.click(aIn1Pos);
        expect(tool()).toBe(defaultTool);

        input.click(s2PortPos);
        expect(tool()).toBe(WiringTool);
        input.click(aIn2Pos);
        expect(tool()).toBe(defaultTool);

        // Turn on Switches
        input.click(s1.getPos());
        expect(tool()).toBe(defaultTool);
        input.click(s2.getPos());
        expect(tool()).toBe(defaultTool);

        expect(s1).toBeConnectedTo(l);
        expect(s2).toBeConnectedTo(l);
        expect(l.isOn()).toBeTruthy();
    });
});
