import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";



describe("ANDGate", () => {
    describe("ANDGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [a, b], [o]] = AutoPlace(new ANDGate());

        test("Initial State", () => {
            expect(o.isOn()).toBe(false);
        });
        test("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        test("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(false);
        });
        test("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
        test("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
    });

    describe("NANDGate", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [a, b], [o]] = AutoPlace(new ANDGate(true));

        test("Initial State", () => {
            expect(o.isOn()).toBe(true);
        });
        test("Input A and B Off", () => {
            a.activate(false);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        test("Input A On", () => {
            a.activate(true);
            b.activate(false);

            expect(o.isOn()).toBe(true);
        });
        test("Input B On", () => {
            a.activate(false);
            b.activate(true);

            expect(o.isOn()).toBe(true);
        });
        test("Input A and B On", () => {
            a.activate(true);
            b.activate(true);

            expect(o.isOn()).toBe(false);
        });
    });
});
