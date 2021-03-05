import "jest";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch}          from "digital/models/ioobjects/inputs/Switch";
import {Encoder}         from "digital/models/ioobjects/other/Encoder";
import {Decoder}         from "digital/models/ioobjects/other/Decoder";
import {LED}             from "digital/models/ioobjects/outputs/LED";

import {GetHelpers} from "test/helpers/Helpers";


describe("Encoder", () => {
    describe("Encoder", () => {
        const designer = new DigitalCircuitDesigner(0);
        const {Place, Connect} = GetHelpers({designer});
        const i1 = new Switch(), i2 = new Switch(), i3 = new Switch(), i4 = new Switch();
        const e = new Encoder();
        const o1 = new LED(), o2 = new LED();

        Place(i1, i2, i3, i4, e, o1, o2);
        Connect(i1, 0,  e, 0);
        Connect(i2, 0,  e, 1);
        Connect(i3, 0,  e, 2);
        Connect(i4, 0,  e, 3);
        Connect(e, 0,  o1, 0);
        Connect(e, 1,  o2, 0);

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
        const {Place, Connect} = GetHelpers({designer});
        const i1 = new Switch(), i2 = new Switch();
        const e = new Decoder();
        const o1 = new LED(), o2 = new LED(), o3 = new LED(), o4 = new LED();

        Place(i1, i2, e, o1, o2, o3, o4);
        Connect(i1, 0,  e, 0);
        Connect(i2, 0,  e, 1);
        Connect(e, 0,  o1, 0);
        Connect(e, 1,  o2, 0);
        Connect(e, 2,  o3, 0);
        Connect(e, 3,  o4, 0);

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
