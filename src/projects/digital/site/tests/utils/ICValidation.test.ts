import "digital/api/circuit/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";
import {IsValidIC} from "digital/site/utils/ICValidation";


describe("ICValidation", () => {
    describe("Valid cases", () => {
        test("Basic Switch and LED", () => {
            const [_circuit, _, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("Switch");
            expect(IsValidIC([sw, led])).toBeTruthy();
        });
        test("Basic Gate", () => {
            const [_circuit, _, { PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            expect(IsValidIC([sw1, sw2, gate, led])).toBeTruthy();
        });
        test("Two separate circuits", () => {
            const [_circuit, _, { PlaceAndConnect }] = CreateTestCircuit();
            const [gate1, { inputs: [sw11, sw12], outputs: [led1] }] = PlaceAndConnect("ANDGate");
            const [gate2, { inputs: [sw21, sw22], outputs: [led2] }] = PlaceAndConnect("ANDGate");
            expect(IsValidIC([sw11, sw12, gate1, led1, sw21, sw22, gate2, led2])).toBeTruthy();
        });
        test("Gate with only one input", () => {
            const [_circuit, _, { Connect, Place }] = CreateTestCircuit();
            const [sw, gate, led] = Place("Switch", "ANDGate", "LED");
            Connect(sw, gate);
            Connect(gate, led);
            expect(IsValidIC([sw, gate, led])).toBeTruthy();
        });
        test("With Label", () => {
            const [_circuit, _, { PlaceAndConnect, Place }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            const [label] = Place("Label");
            expect(IsValidIC([sw1, sw2, gate, led, label])).toBeTruthy();
        });
    });

    describe("Invalid cases", () => {
        test("Missing input", () => {
            const [_circuit, _, { Connect, Place }] = CreateTestCircuit();
            const [gate, led] = Place("ANDGate", "LED");
            Connect(gate, led);
            expect(IsValidIC([gate, led])).toBeFalsy();
        });
        test("Missing output", () => {
            const [_circuit, _, { Connect, Place }] = CreateTestCircuit();
            const [sw, gate] = Place("Switch", "ANDGate");
            Connect(sw, gate);
            expect(IsValidIC([sw, gate])).toBeFalsy();
        });
        test("Unconnected components", () => {
            const [_circuit, _, { Place }] = CreateTestCircuit();
            const [sw, gate, led] = Place("Switch", "ANDGate", "LED");
            expect(IsValidIC([sw, gate, led])).toBeFalsy();
        });
        test("Completed circuit and extra component", () => {
            const [_circuit, _, { PlaceAndConnect, Place }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            const [gate2] = Place("ORGate");
            expect(IsValidIC([sw1, sw2, gate, led, gate2])).toBeFalsy();
        });
        test("Only Label", () => {
            const [_circuit, _, { Place }] = CreateTestCircuit();
            const [label] = Place("Label");
            expect(IsValidIC([label])).toBeFalsy();
        });
        test("Oscilloscope", () => {
            const [_circuit, _, { PlaceAndConnect }] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const [scope, { inputs: [sw] }] = PlaceAndConnect("Oscilloscope");
            expect(IsValidIC([sw, scope])).toBeFalsy();
        });
        test("Clock", () => {
            const [_circuit, _, { PlaceAndConnect }] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const [clock, { outputs: [led] }] = PlaceAndConnect("Clock");
            expect(IsValidIC([clock, led])).toBeFalsy();
        });
    });
});
