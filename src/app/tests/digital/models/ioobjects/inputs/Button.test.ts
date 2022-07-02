import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";

import {Button} from "digital/models/ioobjects/inputs/Button";
import {Switch} from "digital/models/ioobjects/inputs/Switch";

import {LED} from "digital/models/ioobjects/outputs/LED";



describe("Button", () => {
    const designer = new DigitalCircuitDesigner(0);
    const { Place, Connect } = GetHelpers(designer);

    const [a, b, b2, g, o, o2] = Place(new Switch(), new Button() , new Button(),
                                       new ANDGate(), new LED() , new LED());
    Connect(a,  g);
    Connect(b,  g);
    Connect(g,  o);
    Connect(b2, o2);

    test("Initial State", () => {
        b2.press();

        expect(o2.isOn()).toBe(true);
        b2.release();
    });

    test("Input A and B Off", () => {
        a.activate(false);
        b.activate(false);

        expect(o.isOn()).toBe(false);
        b.release();
    });

    test("Input A On", () => {
        a.activate(true);
        b.activate(false);

        expect(o.isOn()).toBe(false);
    });

    test("Input B On", () => {
        a.activate(false);
        b.press();

        expect(o.isOn()).toBe(false);
        b.release();
    });

    test("Input A and B On", () => {
        a.activate(true);
        b.press();

        expect(o.isOn()).toBe(true);
        b.release();
    });
});
