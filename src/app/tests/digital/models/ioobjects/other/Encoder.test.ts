import {GetHelpers} from "test/helpers/Helpers";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";

import {Decoder} from "digital/models/ioobjects/other/Decoder";
import {Encoder} from "digital/models/ioobjects/other/Encoder";



describe("Encoder", () => {
    describe("Encoder", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [i1,i2,i3,i4], [o1,o2]] = AutoPlace(new Encoder());

        test("0 0 0 1 -> 0 0", () => {
            i4.activate(false);
            i3.activate(false);
            i2.activate(false);
            i1.activate(true);

            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(false);
        });
        test("0 0 1 0 -> 0 1", () => {
            i4.activate(false);
            i3.activate(false);
            i2.activate(true);
            i1.activate(false);

            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(true);
        });
        test("0 1 0 0 -> 1 0", () => {
            i4.activate(false);
            i3.activate(true);
            i2.activate(false);
            i1.activate(false);

            expect(o2.isOn()).toBe(true);
            expect(o1.isOn()).toBe(false);
        });
        test("1 0 0 0 -> 1 1", () => {
            i4.activate(true);
            i3.activate(false);
            i2.activate(false);
            i1.activate(false);

            expect(o2.isOn()).toBe(true);
            expect(o1.isOn()).toBe(true);
        });
    });

    describe("Decoder", () => {
        const designer = new DigitalCircuitDesigner(0);
        const { AutoPlace } = GetHelpers(designer);

        const [, [i1,i2], [o1,o2,o3,o4]] = AutoPlace(new Decoder());

        test("Initial State", () => {
            expect(o4.isOn()).toBe(false);
            expect(o3.isOn()).toBe(false);
            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(true);
        });
        test("0 0 -> 0 0 0 1", () => {
            i2.activate(false);
            i1.activate(false);

            expect(o4.isOn()).toBe(false);
            expect(o3.isOn()).toBe(false);
            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(true);
        });
        test("0 1 -> 0 0 1 0", () => {
            i2.activate(false);
            i1.activate(true);

            expect(o4.isOn()).toBe(false);
            expect(o3.isOn()).toBe(false);
            expect(o2.isOn()).toBe(true);
            expect(o1.isOn()).toBe(false);
        });
        test("1 0 -> 0 1 0 0", () => {
            i2.activate(true);
            i1.activate(false);

            expect(o4.isOn()).toBe(false);
            expect(o3.isOn()).toBe(true);
            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(false);
        });
        test("1 1 -> 1 0 0 0", () => {
            i2.activate(true);
            i1.activate(true);

            expect(o4.isOn()).toBe(true);
            expect(o3.isOn()).toBe(false);
            expect(o2.isOn()).toBe(false);
            expect(o1.isOn()).toBe(false);
        });
    });
});
