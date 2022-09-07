import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {BUFGate} from "digital/models/ioobjects/gates/BUFGate";


describe("BUFGate", () => {
    describe("BUFGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [a], [o]] = AutoPlace(new BUFGate());

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        test("Input on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(true);
        });
        test("Input off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(false);
        });
    });

    describe("NOTGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [a], [o]] = AutoPlace(new BUFGate(true));

        test("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        test("Input on", () => {
            a.activate(true);

            expect(o.isOn()).toBe(false);
        });
        test("Input off", () => {
            a.activate(false);

            expect(o.isOn()).toBe(true);
        });
    });
});
