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
import {FormatMap, FormatProps}    from "digital/utils/ExpressionParserConstants";

function testOneInput(expression: string, expected: boolean[], ignoreFirst: boolean, inputMap: Map<string, DigitalComponent>) {
    const a = new Switch(), o = new LED();
    if (inputMap === null) {
        inputMap = new Map([
            ["a", a]
        ]);
    }
    const designer = new DigitalCircuitDesigner(0);

    const objectSet = ExpressionToCircuit(inputMap, expression, o);
    designer.addGroup(objectSet);

    test("Initial State", () => {
        if (!ignoreFirst)
            expect(o.isOn()).toBe(expected[0]);
    });
    test("Input on", () => {
        a.activate(true);

        expect(o.isOn()).toBe(expected[1]);
    });
    test("Input off", () => {
        a.activate(false);

        expect(o.isOn()).toBe(expected[2]);
    });

}

function testTwoInputs(expression: string, expected: boolean[], ignoreFirst: boolean, inputMap: Map<string, DigitalComponent>) {
    const a = new Switch(), b = new Switch(), o = new LED();
    if (inputMap === null) {
        inputMap = new Map([
            ["a", a],
            ["b", b]
        ]);
    }
    const designer = new DigitalCircuitDesigner(0);

    const objectSet = ExpressionToCircuit(inputMap, expression, o);
    designer.addGroup(objectSet);


    test("Initial State", () => {
        if (!ignoreFirst)
            expect(o.isOn()).toBe(expected[0]);
    });
    test("Input a on", () => {
        a.activate(true);

        expect(o.isOn()).toBe(expected[1]);
    });
    test("Input a,b on", () => {
        b.activate(true);

        expect(o.isOn()).toBe(expected[2]);
    });
    test("Input b on", () => {
        a.activate(false);

        expect(o.isOn()).toBe(expected[3]);
    });
    test("Inputs off", () => {
        b.activate(false);

        expect(o.isOn()).toBe(expected[4]);
    });
}

function testThreeInputs(expression: string, expected: boolean[], ignoreFirst: boolean, inputMap: Map<string, DigitalComponent>) {
    const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
    if (inputMap === null) {
        inputMap = new Map([
            ["a", a],
            ["b", b],
            ["c", c]
        ]);
    }
    const designer = new DigitalCircuitDesigner(0);

    const objectSet = ExpressionToCircuit(inputMap, expression, o);
    designer.addGroup(objectSet);

    test("Initial State", () => {
        if (!ignoreFirst)
            expect(o.isOn()).toBe(expected[0]);
    });
    test("Input a on", () => {
        a.activate(true);

        expect(o.isOn()).toBe(expected[1]);
    });
    test("Input a,b on", () => {
        b.activate(true);

        expect(o.isOn()).toBe(expected[2]);
    });
    test("Input a,c on", () => {
        b.activate(false);
        c.activate(true);

        expect(o.isOn()).toBe(expected[3]);
    });
    test("Input a,b,c on", () => {
        b.activate(true);

        expect(o.isOn()).toBe(expected[4]);
    });
    test("Input b,c on", () => {
        a.activate(false);

        expect(o.isOn()).toBe(expected[5]);
    });
    test("Input c on", () => {
        b.activate(false);

        expect(o.isOn()).toBe(expected[6]);
    });
    test("Input b on", () => {
        b.activate(true);
        c.activate(false);

        expect(o.isOn()).toBe(expected[7]);
    });
    test("Inputs off", () => {
        b.activate(false);

        expect(o.isOn()).toBe(expected[8]);
    });
}

// Probably a better way to generalize this, just using separate functions for now
function runTests(numInputs: number, expression: string, expected: boolean[], ignoreFirst: boolean = false, inputMap: Map<string, DigitalComponent> = null) {
    if (numInputs === 1)
        testOneInput(expression, expected, ignoreFirst, inputMap);
    else if (numInputs === 2)
        testTwoInputs(expression, expected, ignoreFirst, inputMap);
    else if (numInputs === 3)
        testThreeInputs(expression, expected, ignoreFirst, inputMap);
    else
        expect(true).toBe(false);
}

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
            }).toThrow("Missing Right Operand: !");
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

        test("No Operator", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"a b",o);
            }).toThrow("No valid operator between a and b");
            expect(() => {
                ExpressionToCircuit(inputMap,"a (b)",o);
            }).toThrow("No valid operator between a and b");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a) b",o);
            }).toThrow("No valid operator between a and b");
            expect(() => {
                ExpressionToCircuit(inputMap,"a !b",o);
            }).toThrow("No valid operator between a and b");
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
            const expected = [false, true, false];
            runTests(1, "a", expected);
        });

        describe("Parse: ' a '", () => {
            const expected = [false, true, false];
            runTests(1, " a ", expected);
        });

        describe("Parse: '(a)'", () => {
            const expected = [false, true, false];
            runTests(1, "(a)", expected);
        });

        describe("Parse: ' (  a ) '", () => {
            const expected = [false, true, false];
            runTests(1, " (  a ) ", expected);
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
            const expected = [true, false, true];
            runTests(1, "!a", expected);
        });

        describe("Parse: '!!a'", () => {
            const expected = [false, true, false];
            runTests(1, "!!a", expected, true);
        });

        describe("Parse: '!!!a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            const objectSet = ExpressionToCircuit(inputMap, "!!!a", o);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input on", () => {
                a.activate(true);

                //*****************************
                // expect(o.isOn()).toBe(false);
            });
            test("Input off", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });

        describe("Parse: '!(!a)'", () => {
            const expected = [false, true, false];
            runTests(1, "!(!a)", expected, true);
        });

        describe("Parse: 'a&a'", () => {
            const expected = [false, true, false];
            runTests(1, "a&a", expected);
        });

        describe("Parse: 'a|a'", () => {
            const expected = [false, true, false];
            runTests(1, "a|a", expected);
        });

        describe("Parse: 'a^a'", () => {
            const expected = [false, false, false];
            runTests(1, "a^a", expected);
        });

        describe("Parse: 'a^!a'", () => {
            const expected = [true, true, true];
            runTests(1, "a^!a", expected, true);
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
            const expected = [false, false, true, false, false];
            runTests(2, "a&b", expected);
        });

        describe("Parse: 'a & b'", () => {
            const expected = [false, false, true, false, false];
            runTests(2, "a & b", expected);
        });

        describe("Parse: 'a^b'", () => {
            const expected = [false, true, false, true, false];
            runTests(2, "a^b", expected);
        });

        describe("Parse: 'a|b'", () => {
            const expected = [false, true, true, true, false];
            runTests(2, "a|b", expected);
        });

        describe("Parse: '(a)|b'", () => {
            const expected = [false, true, true, true, false];
            runTests(2, "(a)|b", expected);
        });

        describe("Parse: '!(a&b)'", () => {
            const expected = [true, true, false, true, true];
            runTests(2, "!(a&b)", expected);
        });

        describe("Parse: '!(!a|b)'", () => {
            const expected = [false, true, false, false, false];
            runTests(2, "!(!a|b)", expected, true);
        });

        describe("Parse: '!a&b'", () => {
            const expected = [false, false, false, true, false];
            runTests(2, "!a&b", expected);
        });

        describe("Parse: 'a&!b'", () => {
            const expected = [false, true, false, false, false];
            runTests(2, "a&!b", expected);
        });

        describe("Parse: '!a&!b'", () => {
            const expected = [true, false, false, false, true];
            runTests(2, "!a&!b", expected, true);
        });

        describe("Parse: '!(a^b)'", () => {
            const expected = [true, false, true, false, true];
            runTests(2, "!(a^b)", expected);
        });

        describe("Parse: ' ! ( a ^ b ) '", () => {
            const expected = [true, false, true, false, true];
            runTests(2, " ! ( a ^ b ) ", expected);
        });

        describe("Parse: '!(a|b)'", () => {
            const expected = [true, false, false, false, true];
            runTests(2, "!(a|b)", expected);
        });
    });

    describe("3 Inputs", () => {
        describe("Parse: 'a&b&c'", () => {
            const expected = [false, false, false, false, true, false, false, false, false];
            runTests(3, "a&b&c", expected);
        });

        describe("Parse: 'a&b|c'", () => {
            const expected = [false, false, true, true, true, true, true, false, false];
            runTests(3, "a&b|c", expected);
        });

        describe("Parse: 'c|a&b'", () => {
            const expected = [false, false, true, true, true, true, true, false, false];
            runTests(3, "c|a&b", expected);
        });

        describe("Parse: 'a&(b|c)'", () => {
            const expected = [false, false, true, true, true, false, false, false, false];
            runTests(3, "a&(b|c)", expected);
        });

        describe("Parse: '(a&((b)|c))'", () => {
            const expected = [false, false, true, true, true, false, false, false, false];
            runTests(3, "(a&((b)|c))", expected);
        });
    });

    describe("Alternate Formats", () => {
        describe("Parse: 'a&&b&&c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const ops = FormatMap.get("||");

            const objectSet = ExpressionToCircuit(inputMap, "a&&b&&c", o, ops);
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

        describe("Parse: 'a*b*c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const ops = FormatMap.get("+");

            const objectSet = ExpressionToCircuit(inputMap, "a*b*c", o, ops);
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

        describe("Parse: 'a||b||c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const ops = FormatMap.get("||");

            const objectSet = ExpressionToCircuit(inputMap, "a||b||c", o, ops);
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

                expect(o.isOn()).toBe(true);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: 'a+b+c'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), b = new Switch(), c = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b],
                ["c", c]
            ]);

            const ops = FormatMap.get("+");

            const objectSet = ExpressionToCircuit(inputMap, "a+b+c", o, ops);
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

                expect(o.isOn()).toBe(true);
            });
            test("Inputs off", () => {
                b.activate(false);

                expect(o.isOn()).toBe(false);
            });
        });

        describe("Parse: '_a'", () => {
            const designer = new DigitalCircuitDesigner(0);
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
            ]);

            const ops = FormatMap.get("+_");

            const objectSet = ExpressionToCircuit(inputMap, "_a", o, ops);
            designer.addGroup(objectSet);

            test("Initial State", () => {
                expect(o.isOn()).toBe(true);
            });
            test("Input a on", () => {
                a.activate(true);

                expect(o.isOn()).toBe(false);
            });
            test("Inputs off", () => {
                a.activate(false);

                expect(o.isOn()).toBe(true);
            });
        });
    });

    describe("Simplification", () => {
        describe("Parse and Condense: '!(a|b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);
            const designer = new DigitalCircuitDesigner(0);
        
            const objectSet = ExpressionToCircuit(inputMap, "!(a|b)", o);
            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });
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
        
        describe("Parse and Condense: '!(a^b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);
            const designer = new DigitalCircuitDesigner(0);
        
            const objectSet = ExpressionToCircuit(inputMap, "!(a^b)", o);
            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });
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
        
        describe("Parse and Condense: '!(a&b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);
            const designer = new DigitalCircuitDesigner(0);
        
            const objectSet = ExpressionToCircuit(inputMap, "!(a&b)", o);
            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });
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
    });
});
