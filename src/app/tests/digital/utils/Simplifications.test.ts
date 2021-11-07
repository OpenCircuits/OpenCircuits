import "jest";

import {IOObject} from "core/models";
import {DigitalCircuitDesigner} from "digital/models";
import {Switch, LED, ANDGate, ORGate, XORGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {DigitalObjectSet, LazyConnect} from "digital/utils/ComponentUtils";
import {CreateNegatedGates} from "digital/utils/simplifications/CreateNegatedGates";


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
            objects.push(LazyConnect(a, and));
            objects.push(LazyConnect(b, and));
            objects.push(LazyConnect(and, not));
            objects.push(LazyConnect(not, o));

            const circuit = new DigitalObjectSet(objects);
            const designer = new DigitalCircuitDesigner(0);
            designer.addGroup(circuit);

            CreateNegatedGates(designer, circuit);
    
            test("NOTGate and ANDGate removed", () => {
                expect(and.getDesigner()).toBe(undefined);
                expect(not.getDesigner()).toBe(undefined);
            });

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
        
        // describe("!(a|b)", () => {
        //     const a = new Switch(), b = new Switch(), o = new LED();
        //     const or = new ORGate(), not = new NOTGate();
        //     const objects: IOObject[] = [
        //         a,
        //         b,
        //         o,
        //         or,
        //         not
        //     ];
        //     objects.push(LazyConnect(a, or));
        //     objects.push(LazyConnect(b, or));
        //     objects.push(LazyConnect(or, not));
        //     objects.push(LazyConnect(not, o));
        //     const condensed = CreateNegatedGates(objects);
    
        //     test("Correct number of things", () => {
        //         expect(condensed.length).toBe(7);
        //     });
    
        //     const designer = new DigitalCircuitDesigner(0);
        //     designer.addGroup(new DigitalObjectSet(condensed));
        //     describe("Correct Circuit", () => {
        //         test("Initial State", () => {
        //             expect(o.isOn()).toBe(true);
        //         });
        //         test("Input a on", () => {
        //             a.activate(true);
            
        //             expect(o.isOn()).toBe(false);
        //         });
        //         test("Input a,b on", () => {
        //             b.activate(true);
            
        //             expect(o.isOn()).toBe(false);
        //         });
        //         test("Input b on", () => {
        //             a.activate(false);
            
        //             expect(o.isOn()).toBe(false);
        //         });
        //         test("Inputs off", () => {
        //             b.activate(false);
            
        //             expect(o.isOn()).toBe(true);
        //         });
        //     });
        // });
        
        // describe("!(a^b)", () => {
        //     const a = new Switch(), b = new Switch(), o = new LED();
        //     const xor = new XORGate(), not = new NOTGate();
        //     const objects: IOObject[] = [
        //         a,
        //         b,
        //         o,
        //         xor,
        //         not
        //     ];
        //     objects.push(LazyConnect(a, xor));
        //     objects.push(LazyConnect(b, xor));
        //     objects.push(LazyConnect(xor, not));
        //     objects.push(LazyConnect(not, o));
        //     const condensed = CreateNegatedGates(objects);
    
        //     test("Correct number of things", () => {
        //         expect(condensed.length).toBe(7);
        //     });
    
        //     const designer = new DigitalCircuitDesigner(0);
        //     designer.addGroup(new DigitalObjectSet(condensed));
        //     describe("Correct Circuit", () => {
        //         test("Initial State", () => {
        //             expect(o.isOn()).toBe(true);
        //         });
        //         test("Input a on", () => {
        //             a.activate(true);
            
        //             expect(o.isOn()).toBe(false);
        //         });
        //         test("Input a,b on", () => {
        //             b.activate(true);
            
        //             expect(o.isOn()).toBe(true);
        //         });
        //         test("Input b on", () => {
        //             a.activate(false);
            
        //             expect(o.isOn()).toBe(false);
        //         });
        //         test("Inputs off", () => {
        //             b.activate(false);
            
        //             expect(o.isOn()).toBe(true);
        //         });
        //     });
        // });
    });
});
