import "jest";

import { IOObject } from "core/models";
import { DigitalCircuitDesigner } from "digital/models";
import { Switch, LED, ANDGate } from "digital/models/ioobjects";
import { NOTGate } from "digital/models/ioobjects/gates/BUFGate";
import { DigitalObjectSet } from "digital/utils/ComponentUtils";
import { ConnectGate } from "digital/utils/ExpressionParser/Utils";
import { CreateNegatedGates } from "digital/utils/simplifications/CreateNegatedGates";


describe("Simplifications", () => {
    describe("Create Negation Gates", () => {
        describe("!(a&b)", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const and = new ANDGate(), not = new NOTGate();
            const objects: IOObject[] = [
                a,
                b,
                o,
                and,
                not
            ];
            objects.push(ConnectGate(a, and));
            objects.push(ConnectGate(b, and));
            objects.push(ConnectGate(and, not));
            objects.push(ConnectGate(not, o));
            const condensed = CreateNegatedGates(objects);
    
            test("Correct number of things", () => {
                expect(condensed.length).toBe(7);
            });
    
            const designer = new DigitalCircuitDesigner(0);
            designer.addGroup(new DigitalObjectSet(condensed));
            describe("Correct Circuit", () => {
                test("Initial State", () => {
                    expect(o.isOn()).toBe(true);
                });
                test("Input a on", () => {
                    a.activate(true);
            
                    expect(o.isOn()).toBe(true);
                });
                test("Input a,b on", () => {
                    b.activate(true);
            
                    expect(o.isOn()).toBe(false);
                });
                test("Input b on", () => {
                    a.activate(false);
            
                    expect(o.isOn()).toBe(true);
                });
                test("Inputs off", () => {
                    b.activate(false);
            
                    expect(o.isOn()).toBe(true);
                });
            });
        });
    });
});
