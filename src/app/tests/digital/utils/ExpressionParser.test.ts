import "jest";


import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {ConnectionAction} from "core/actions/addition/ConnectionAction";
import {Switch}              from "digital/models/ioobjects/inputs/Switch";
import {ConstantHigh}    from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow}    from "digital/models/ioobjects/inputs/ConstantLow";
import {ANDGate}         from "digital/models/ioobjects/gates/ANDGate";
import {ORGate}            from "digital/models/ioobjects/gates/ORGate";
import {LED}                 from "digital/models/ioobjects/outputs/LED";
import {DigitalWire} from "digital/models/DigitalWire";
import {DigitalComponent} from "digital/models/index";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {IOObject} from "core/models/IOObject";

import {ExpressionToCircuit} from "digital/utils/ExpressionParser";

describe("Expression Parser", () => {
    describe("Invalid Inputs", () => {
        test("Null Parameters", () => {
            const o = new LED();
            const inputMap = new Map<string, DigitalComponent>();

            expect(() => {
                ExpressionToCircuit(null,"",o);
            }).toThrow("Null Parameter: inputs");
            expect(() => {
                ExpressionToCircuit(inputMap,null,o);
            }).toThrow("Null Parameter: expression");
            expect(() => {
                ExpressionToCircuit(inputMap,"",null);
            }).toThrow("Null Parameter: output");
        });

        test("Not An Input", () => {
            const a = new LED(), b = new ORGate(), o1 = new LED(), o2 = new LED();
            const inputMap1 = new Map([
                ["a", a]
            ]);
            const inputMap2 = new Map([
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap1,"a",o1);
            }).toThrow("Not An Input: a");

            expect(() => {
                ExpressionToCircuit(inputMap2,"b",o2);
            }).toThrow("Not An Input: b");
        });

        test("Not An Output", () => {
            const a = new Switch(), b = new Switch(), o1 = new ANDGate(), o2 = new Switch();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"a|b",o1);
            }).toThrow("Supplied Output Is Not An Output");

            expect(() => {
                ExpressionToCircuit(inputMap,"a|b",o2);
            }).toThrow("Supplied Output Is Not An Output");
        });

        test("Input Not Found", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"a|b",o);
            }).toThrow("Input Not Found: b");
        });

        test("Unmatched '(' and ')'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"(",o);
            }).toThrow("Encountered Unmatched (");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a|b",o);
            }).toThrow("Encountered Unmatched (");
            expect(() => {
                ExpressionToCircuit(inputMap,"((a|b)",o);
            }).toThrow("Encountered Unmatched (");
            expect(() => {
                ExpressionToCircuit(inputMap,")",o);
            }).toThrow("Encountered Unmatched )");
            expect(() => {
                ExpressionToCircuit(inputMap,"a|b)",o);
            }).toThrow("Encountered Unmatched )");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a|b))",o);
            }).toThrow("Encountered Unmatched )");
        });

        test("Missing Operands", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"!",o);
            }).toThrow("Missing Operand: !");
            expect(() => {
                ExpressionToCircuit(inputMap,"&a",o);
            }).toThrow("Missing Left Operand: &");
            expect(() => {
                ExpressionToCircuit(inputMap,"a&",o);
            }).toThrow("Missing Right Operand: &");
            expect(() => {
                ExpressionToCircuit(inputMap,"^a",o);
            }).toThrow("Missing Left Operand: ^");
            expect(() => {
                ExpressionToCircuit(inputMap,"a^",o);
            }).toThrow("Missing Right Operand: ^");
            expect(() => {
                ExpressionToCircuit(inputMap,"|a",o);
            }).toThrow("Missing Left Operand: |");
            expect(() => {
                ExpressionToCircuit(inputMap,"a|",o);
            }).toThrow("Missing Right Operand: |");
        });
    });

    describe("0 Inputs", () => {
        test("Parse: ''", () => {
            const o = new LED();
            const inputMap = new Map<string, DigitalComponent>();

            const objectSet = ExpressionToCircuit(inputMap, "", o);

            expect(objectSet.toList().length).toBe(0);
        });
        test("Parse: ' '", () => {
            const o = new LED();
            const inputMap = new Map<string, DigitalComponent>();

            const objectSet = ExpressionToCircuit(inputMap, " ", o);
            
            expect(objectSet.toList().length).toBe(0);
        });
        test("Parse: '()'", () => {
            const o = new LED();
            const inputMap = new Map<string, DigitalComponent>();

            const objectSet = ExpressionToCircuit(inputMap, "()", o);
            
            expect(objectSet.toList().length).toBe(0);
        });
        test("Parse: ' ( ) '", () => {
            const o = new LED();
            const inputMap = new Map<string, DigitalComponent>();

            const objectSet = ExpressionToCircuit(inputMap, " ( ) ", o);
            
            expect(objectSet.toList().length).toBe(0);
        });
    });

    describe("1 Input", () => {
        describe("Parse: 'a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a", o);
            designer.addGroup(objectSet);

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

        describe("Parse: ' a '", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, " a ", o);
            designer.addGroup(objectSet);

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

        describe("Parse: '(a)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "(a)", o);
            designer.addGroup(objectSet);

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

        describe("Parse: ' (  a ) '", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, " (  a ) ", o);
            designer.addGroup(objectSet);

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

        describe("Parse: 'a' (ConstantHigh)", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new ConstantHigh(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: 'a' (ConstantLow)", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new ConstantLow(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '!a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!a", o);
            designer.addGroup(objectSet);

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

        describe("Parse: '!!a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!!a", o);
            designer.addGroup(objectSet);

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

        describe("Parse: '!!!a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!!!a", o);
            designer.addGroup(objectSet);

            console.log(objectSet);

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

        describe("Parse: '!(!a)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!(!(a))", o);
            designer.addGroup(objectSet);

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

        describe("Parse: 'a&a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&a", o);
            designer.addGroup(objectSet);

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

        describe("Parse: 'a|a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a|a", o);
            designer.addGroup(objectSet);

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

        describe("Parse: 'a^a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a^a", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input off", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a^!a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a^!a", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input off", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: 'longName'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["longName", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "longName", o);
            designer.addGroup(objectSet);

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
    });

    describe("2 Inputs", () => {
        describe("Parse: 'a&b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a & b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a & b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a^b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a^b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
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

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a|b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a|b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '(a)|b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "(a)|b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '!(a&b)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!(a&b)", o);
            designer.addGroup(objectSet);

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

        describe("Parse: '!a&b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!a&b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
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

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a&!b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&!b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
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

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '!a&!b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!a&!b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: '!(a^b)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!(a^b)", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: ' ! ( a ^ b ) '", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, " ! ( a ^ b ) ", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: '!(a|b)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!(a|b)", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input b on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });
    });

    describe("3 Inputs", () => {
        describe("Parse: 'a&b&c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&b&c", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,c on", () => {
                b.activate(false);
                c.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b,c on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b,c on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input c on", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input b on", () => {
                b.activate(true);
                c.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a&b|c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&b|c", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,c on", () => {
                b.activate(false);
                c.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b,c on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b,c on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Input c on", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                b.activate(true);
                c.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'c|a&b'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "c|a&b", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,c on", () => {
                b.activate(false);
                c.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b,c on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b,c on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Input c on", () => {
                b.activate(false);

                expect(o.isOn()).toBe(true);
            });
            test("Input b on", () => {
                b.activate(true);
                c.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a&(b|c)'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&(b|c)", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,c on", () => {
                b.activate(false);
                c.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b,c on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b,c on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input c on", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input b on", () => {
                b.activate(true);
                c.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '(a&((b)|c))'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "a&(b|c)", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(false);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Input a,b on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,c on", () => {
                b.activate(false);
                c.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input a,b,c on", () => {
                b.activate(true);

                expect(o.isOn()).toBe(true);
            });
            test("Input b,c on", () => {
                a.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input c on", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Input b on", () => {
                b.activate(true);
                c.activate(false);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });
    });
});
