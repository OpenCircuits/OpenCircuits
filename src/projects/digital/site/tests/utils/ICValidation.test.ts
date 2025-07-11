import "digital/api/circuit/tests/helpers/Extensions";
import "shared/tests/helpers/Extensions";

import {CreateTestCircuit} from "digital/api/circuit/tests/helpers/CreateTestCircuit";
import {ICValidationStatus, IsValidIC} from "digital/site/utils/ICValidation";


describe("ICValidation", () => {
    describe("Valid cases", () => {
        test("Basic Switch and LED", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("Switch");
            expect(IsValidIC([sw, led])).toBe(ICValidationStatus.Valid);
        });
        test("Basic Button and LED", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("Button");
            expect(IsValidIC([sw, led])).toBe(ICValidationStatus.Valid);
        });
        test("Basic Constant Low and LED", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("ConstantLow");
            expect(IsValidIC([sw, led])).toBe(ICValidationStatus.Valid);
        });
        test("Basic Constant High and LED", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs: [led] }] = PlaceAndConnect("ConstantHigh");
            expect(IsValidIC([sw, led])).toBe(ICValidationStatus.Valid);
        });
        test("Basic Constant Number and LEDs", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [sw, { outputs }] = PlaceAndConnect("ConstantNumber");
            expect(IsValidIC([sw, ...outputs])).toBe(ICValidationStatus.Valid);
        });
        test("Basic Gate", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            expect(IsValidIC([sw1, sw2, gate, led])).toBe(ICValidationStatus.Valid);
        });
        test("Two separate circuits", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [gate1, { inputs: [sw11, sw12], outputs: [led1] }] = PlaceAndConnect("ANDGate");
            const [gate2, { inputs: [sw21, sw22], outputs: [led2] }] = PlaceAndConnect("ANDGate");
            expect(IsValidIC([sw11, sw12, gate1, led1, sw21, sw22, gate2, led2])).toBe(ICValidationStatus.Valid);
        });
        test("Gate with only one input", () => {
            const [_circuit, { Connect, Place }] = CreateTestCircuit();
            const [sw, gate, led] = Place("Switch", "ANDGate", "LED");
            Connect(sw, gate);
            Connect(gate, led);
            expect(IsValidIC([sw, gate, led])).toBe(ICValidationStatus.Valid);
        });
        test("With Label", () => {
            const [_circuit, { PlaceAndConnect, Place }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            const [label] = Place("Label");
            expect(IsValidIC([sw1, sw2, gate, led, label])).toBe(ICValidationStatus.Valid);
        });
    });

    describe("Invalid cases", () => {
        test("Missing input", () => {
            const [_circuit, { Connect, Place }] = CreateTestCircuit();
            const [gate, led] = Place("ANDGate", "LED");
            Connect(gate, led);
            expect(IsValidIC([gate, led])).toBe(ICValidationStatus.NoInput);
        });
        test("Missing output", () => {
            const [_circuit, { Connect, Place }] = CreateTestCircuit();
            const [sw, gate] = Place("Switch", "ANDGate");
            Connect(sw, gate);
            expect(IsValidIC([sw, gate])).toBe(ICValidationStatus.NoOutput);
        });
        test("Unconnected components", () => {
            const [_circuit, { Place }] = CreateTestCircuit();
            const [sw, gate, led] = Place("Switch", "ANDGate", "LED");
            expect([ICValidationStatus.NoInput, ICValidationStatus.NoOutput]).toContain(IsValidIC([sw, gate, led]));
        });
        test("Completed circuit and extra component", () => {
            const [_circuit, { PlaceAndConnect, Place }] = CreateTestCircuit();
            const [gate, { inputs: [sw1, sw2], outputs: [led] }] = PlaceAndConnect("ANDGate");
            const [gate2] = Place("ORGate");
            expect([ICValidationStatus.NoInput, ICValidationStatus.NoOutput]).toContain(IsValidIC([sw1, sw2, gate, led, gate2]));
        });
        test("Only Label", () => {
            const [_circuit, { Place }] = CreateTestCircuit();
            const [label] = Place("Label");
            expect(IsValidIC([label])).toBe(ICValidationStatus.Empty);
        });
        test("Oscilloscope", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const [scope, { inputs: [sw] }] = PlaceAndConnect("Oscilloscope");
            expect(IsValidIC([sw, scope])).toBe(ICValidationStatus.ContainsTimedComponents);
        });
        test("Clock", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit(/* sim= */false);  // Disable sim since it will queue infinitely
            const [clock, { outputs: [led] }] = PlaceAndConnect("Clock");
            expect(IsValidIC([clock, led])).toBe(ICValidationStatus.ContainsTimedComponents);
        });
        test("SegmentDisplay", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [scope, { inputs }] = PlaceAndConnect("SegmentDisplay");
            expect(IsValidIC([...inputs, scope])).toBe(ICValidationStatus.ContainsSegmentDisplays);
        });
        test("BCDDisplay", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [scope, { inputs }] = PlaceAndConnect("BCDDisplay");
            expect(IsValidIC([...inputs, scope])).toBe(ICValidationStatus.ContainsSegmentDisplays);
        });
        test("ASCIIDisplay", () => {
            const [_circuit, { PlaceAndConnect }] = CreateTestCircuit();
            const [scope, { inputs }] = PlaceAndConnect("ASCIIDisplay");
            expect(IsValidIC([...inputs, scope])).toBe(ICValidationStatus.ContainsSegmentDisplays);
        });
    });
});
