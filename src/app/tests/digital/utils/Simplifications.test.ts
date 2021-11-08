import "jest";

import {IOObject} from "core/models";
import {Switch, LED, ANDGate} from "digital/models/ioobjects";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {CreateNegatedGates} from "digital/utils/simplifications/CreateNegatedGates";

import "digital/models/ioobjects";
import {GetHelpers} from "test/helpers/Helpers";
import {Setup} from "test/helpers/Setup";


describe("Simplifications", () => {
    const {designer, input} = Setup();
    const {Place, Connect} = GetHelpers({designer});

    describe("Create Negation Gates", () => {
        describe("!(a&b)", () => {
            const [a, b, and, not, o] = Place(new Switch(), new Switch(), new ANDGate(), new NOTGate(), new LED());

            const objects: IOObject[] = [
                a,
                b,
                o,
                and,
                not
            ];

            objects.push(Connect(a, 0, and, 0).getWire());
            objects.push(Connect(b, 0, and, 1).getWire());
            objects.push(Connect(and, 0, not, 0).getWire());
            objects.push(Connect(not, 0, o, 0).getWire());

            const circuit = new DigitalObjectSet(objects);

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
