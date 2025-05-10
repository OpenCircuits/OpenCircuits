/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateCircuitDesigner} from "tests/helpers/CreateCircuitDesigner";


describe("WiringTool", () => {
    test("Click to Connect Switch -> LED", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw, led] = PlaceAt(["Switch", V(0, 0)], ["LED", V(2, 0)]);

        input.click(sw.outputs[0].targetPos)
            .click(led.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect Switch -> LED", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw, led] = PlaceAt(["Switch", V(0, 0)], ["LED", V(2, 0)]);

        input.drag(sw.outputs[0].targetPos,
                   led.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Click to Connect LED -> Switch (other direction)", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw, led] = PlaceAt(["Switch", V(0, 0)], ["LED", V(2, 0)]);

        input.click(led.inputs[0].targetPos)
            .click(sw.outputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect LED -> Switch (other direction)", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw, led] = PlaceAt(["Switch", V(0, 0)], ["LED", V(2, 0)]);

        input.drag(led.inputs[0].targetPos,
                   sw.outputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Connect Switch to Multiple LEDs", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw, led1, led2] = PlaceAt(["Switch", V(0, 0)], ["LED", V(2, 4)], ["LED", V(2, -4)]);

        input.drag(sw.outputs[0].targetPos,
                   led1.inputs[0].targetPos);
        input.drag(sw.outputs[0].targetPos,
                   led2.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led1);
        expect(sw).toBeConnectedTo(led2);
    });

    test("Try to Connect LED to Multiple Inputs", () => {
        const [designer, input, _, { PlaceAt }] = CreateCircuitDesigner();

        const [sw1, sw2, led] = PlaceAt(["Switch", V(-2, 1)], ["Switch", V(-2, -1)], ["LED", V(0, 0)]);

        input.drag(led.inputs[0].targetPos,
                   sw1.outputs[0].targetPos);
        input.click(sw2.outputs[0].targetPos)
            .click(led.inputs[0].targetPos);

        expect(sw1).toBeConnectedTo(led);
        expect(sw2).not.toBeConnectedTo(led);
    });

    test("Click from Node to Input Port", () => {
        const [designer, input, _, { PlaceAt, Connect }] = CreateCircuitDesigner();

        const [sw, g] = PlaceAt(["Switch", V(0, 0)], ["ANDGate", V(2, 0)]);
        const w = Connect(sw, g.inputs[0])!;
        const { wire1, wire2, node } = w.split();

        input.click(node.pos)
            .click(g.inputs[1].targetPos);

        expect(sw.outputs[0].connections).toHaveLength(1);
        expect(node.inputs[0].connections).toHaveLength(1);
        expect(node.outputs[0].connections).toHaveLength(2);
        expect(g.inputs[0].connections).toHaveLength(1);
        expect(g.inputs[1].connections).toHaveLength(1);
    });
});
