/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
import "shared/api/circuit/tests/helpers/Extensions";

import {V} from "Vector";

import {CreateCircuitDesigner} from "tests/helpers/CreateCircuitDesigner";


describe("WiringTool", () => {
    test("Click to Connect Switch -> LED", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw = designer.circuit.placeComponentAt("Switch", V(0, 0));
        const led = designer.circuit.placeComponentAt("LED", V(2, 0));

        input.click(sw.outputs[0].targetPos)
            .click(led.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect Switch -> LED", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw = designer.circuit.placeComponentAt("Switch", V(0, 0));
        const led = designer.circuit.placeComponentAt("LED", V(2, 0));

        input.drag(sw.outputs[0].targetPos,
                   led.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Click to Connect LED -> Switch (other direction)", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw = designer.circuit.placeComponentAt("Switch", V(0, 0));
        const led = designer.circuit.placeComponentAt("LED", V(2, 0));

        input.click(led.inputs[0].targetPos)
            .click(sw.outputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Drag to Connect LED -> Switch (other direction)", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw = designer.circuit.placeComponentAt("Switch", V(0, 0));
        const led = designer.circuit.placeComponentAt("LED", V(2, 0));

        input.drag(led.inputs[0].targetPos,
                   sw.outputs[0].targetPos);

        expect(sw).toBeConnectedTo(led);
    });

    test("Connect Switch to Multiple LEDs", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw = designer.circuit.placeComponentAt("Switch", V(0, 0));
        const led1 = designer.circuit.placeComponentAt("LED", V(2, 4));
        const led2 = designer.circuit.placeComponentAt("LED", V(2, -4));

        input.drag(sw.outputs[0].targetPos,
                   led1.inputs[0].targetPos);
        input.drag(sw.outputs[0].targetPos,
                   led2.inputs[0].targetPos);

        expect(sw).toBeConnectedTo(led1);
        expect(sw).toBeConnectedTo(led2);
    });

    test("Try to Connect LED to Multiple Inputs", () => {
        const [designer, input] = CreateCircuitDesigner();

        const sw1 = designer.circuit.placeComponentAt("Switch", V(-2, 1));
        const sw2 = designer.circuit.placeComponentAt("Switch", V(-2, -1));
        const led = designer.circuit.placeComponentAt("LED", V(0, 0));

        input.drag(led.inputs[0].targetPos,
                   sw1.outputs[0].targetPos);
        input.click(sw2.outputs[0].targetPos)
            .click(led.inputs[0].targetPos);

        expect(sw1).toBeConnectedTo(led);
        expect(sw2).not.toBeConnectedTo(led);
    });
});
