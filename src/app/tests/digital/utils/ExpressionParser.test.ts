import "jest";

import {InputToken, Token,
        InputTreeUnOpNode, InputTreeBinOpNode, InputTreeIdent,
        OperatorFormat} from "digital/utils/ExpressionParser/Constants/DataStructures";
import {Formats} from "digital/utils/ExpressionParser/Constants/Formats";

import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
import {Switch} from "digital/models/ioobjects/inputs/Switch";
import {ConstantHigh} from "digital/models/ioobjects/inputs/ConstantHigh";
import {ConstantLow} from "digital/models/ioobjects/inputs/ConstantLow";
import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate} from "digital/models/ioobjects/gates/ORGate";
import {LED} from "digital/models/ioobjects/outputs/LED";
import {DigitalComponent} from "digital/models/index";

import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {ExpressionToCircuit} from "digital/utils/ExpressionParser";
import {GenerateInputTree} from "digital/utils/ExpressionParser/GenerateInputTree";
import {GenerateTokens} from "digital/utils/ExpressionParser/GenerateTokens";

import "digital/models/ioobjects";


/**
 * This function is used to create and run a separate test for every combination of switch states.
 * 
 * For each test, switches are set to on or off based on a bitwise and operation of the index of that test
 * in expected and 2 to the power of the index of the Switch in inputs. If the result is 0, then the switch
 * will be off. If it is anything else, it will be on.
 * For example, for a circuit with three Switches a, b, and c in inputs (in that order), expected[6] would
 * have Switches enabled according to the following
 * (2**0 & 6) => 0 so Switch a will be off
 * (2**1 & 6) => 2 so Switch b will be on
 * (2**2 & 6) => 4 so Switch c will be on
 * 
 * Currently, jest runs the test in the opposite order of how they are given in the expected array.
 * This is done to avoid an issue where circuits initial state is incorrect. This is likely due to
 * the same underlying issue as issues #468 and #613 and if those are fixed, this function should
 * also be modified.
 * 
 * @param inputs an array of the names of the switches along with their corresponding Switch,
 *  those same Switch objects must be present in circuit
 * @param circuit the components and wires that make up the circuit being tested
 * @param output the component whose state will be evaluated in the test, must be present in circuit
 * @param expected the expected states of the output LED for all the different switch combinations
 * @throws {Error} if the length of expected is not equal to 2 to the power of the length of inputs
 */
function testInputs(inputs: [string, Switch][], circuit: DigitalObjectSet, output: LED, expected: boolean[]) {
    if (2**inputs.length !== expected.length)
        throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" + 2**inputs.length + ")");

    const designer = new DigitalCircuitDesigner(0);
    designer.addGroup(circuit);

    // Decrements because there can be weird propagation issues when trying to read initial state
    // For more, see issues #468 and #613
    // TODO: Make this increment rather than decrement if/when #468 and #613 are fixed
    for (let num = 2**inputs.length - 1; num >= 0; num--) {
        let testTitle = "Inputs on:";
        for (let index = 0; index < inputs.length; index++)
            if (num & (2**index))
                testTitle += " " + inputs[index][0];
        if (testTitle === "Inputs on:")
            testTitle += " [none]";

        // The loop is repeated because the activation needs to happen within the test
        test(testTitle, () => {
            for (let index = 0; index < inputs.length; index++)
                inputs[index][1].activate(!!(num & (2**index)));
            expect(output.isOn()).toBe(expected[num]);
        });
    }
}

/**
 * This function is similar to testInputs but only generates one test case rather than one for every state
 * 
 * @param inputs an array of the names of the switches along with their corresponding Switch,
 *  those same Switch objects must be present in circuit
 * @param circuit the components and wires that make up the circuit being tested
 * @param output the component whose state will be evaluated in the test, must be present in circuit
 * @param expected the expected states of the output LED for all the different switch combinations
 * @throws {Error} if the length of expected is not equal to 2 to the power of the length of inputs
 * @see testInputs
 */
function testInputsSimple(inputs: [string, Switch][], circuit: DigitalObjectSet, output: LED, expected: boolean[]) {
    if (2 ** inputs.length !== expected.length)
        throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" + 2 ** inputs.length + ")");

    const designer = new DigitalCircuitDesigner(0);
    designer.addGroup(circuit);

    // Decrements because there can be weird propagation issues when trying to read initial state
    // For more, see issues #468 and #613
    // TODO: Make this increment rather than decrement if/when #468 and #613 are fixed
    test("Test all states", () => {
        for (let num = 2 ** inputs.length - 1; num >= 0; num--) {
            for (let index = 0; index < inputs.length; index++)
                inputs[index][1].activate(!!(num & (2 ** index)));
            expect(output.isOn()).toBe(expected[num]);
        }
    });
}

/**
 * This is a function that autogenerates and tests all states of a circuit represented by a given expression.
 * The names of these switches are procedurally generated from "a" through "z". Note that the expression should
 * only use input names available to it. For example, an expression with numInputs=3 should only use a, b, and c
 * as input names.
 * 
 * By default, with numInputs<=3 then a test is created for each state, otherwise one test is created for the entire expression.
 * This behavior can be overwritten with the verbose argument.
 * 
 * @param numInputs the number of switches that are used by this expression/test
 * @param expression the logical boolean expression to test
 * @param expected the expected states of the output LED for all the different switch combinations (see testInputs for order)
 * @param ops the strings used to represent the different operators
 * @param verbose true to force creating a new test for every state, false to force creating one single test encompassing all states
 * @throws {Error} if numInputs > 8
 * @throws {Error} if the length of expected is not equal to 2 to the power of the length of inputs
 * @see testInputs
 * @see ExpressionToCircuit
 */
function runTests(numInputs: number, expression: string, expected: boolean[], ops?: OperatorFormat, verbose?: boolean) {
    describe("Parse: '" + expression + "'", () => {
        if (numInputs > 8)
            throw new Error("Maximum supported number of inputs is 8, you tried to use " + numInputs);

        const o = new LED();
        const inputs: [string, Switch][] = [];
        const charCodeStart = "a".charCodeAt(0);
        for (let i = 0; i < numInputs; i++)
            inputs.push([String.fromCharCode(charCodeStart+i), new Switch()]);

        const objectSet = ExpressionToCircuit(new Map(inputs), expression, o, ops);

        if (verbose === false || (verbose == undefined && numInputs > 3))
            testInputsSimple(inputs, objectSet, o, expected);
        else
            testInputs(inputs, objectSet, o, expected);
    });
}
 
describe("Expression Parser", () => {
    describe("Invalid Inputs", () => {

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
            }).toThrow("Not An Input: \"a\"");

            expect(() => {
                ExpressionToCircuit(inputMap2,"b",o2);
            }).toThrow("Not An Input: \"b\"");
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
            const a = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"b",o);
            }).toThrow("Input Not Found: \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a|b",o);
            }).toThrow("Input Not Found: \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"!b",o);
            }).toThrow("Input Not Found: \"b\"");
        });

        test("Unmatched '(' and ')'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);
            const inputMap2 = new Map();

            expect(() => {
                ExpressionToCircuit(inputMap,"(",o);
            }).toThrow("Encountered Unmatched \"(\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"!(",o);
            }).toThrow("Encountered Unmatched \"(\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a|b",o);
            }).toThrow("Encountered Unmatched \"(\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"((a|b)",o);
            }).toThrow("Encountered Unmatched \"(\"");
            expect(() => {
                ExpressionToCircuit(inputMap,")",o);
            }).toThrow("Encountered Unmatched \")\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a|b)",o);
            }).toThrow("Encountered Unmatched \")\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a|b))",o);
            }).toThrow("Encountered Unmatched \")\"");
            expect(() => {
                ExpressionToCircuit(inputMap,")a|b(",o);
            }).toThrow("Encountered Unmatched \")\"");
            expect(() => {
                ExpressionToCircuit(inputMap,")(",o);
            }).toThrow("Encountered Unmatched \")\"");
            expect(() => {
                ExpressionToCircuit(inputMap2,"(",o);
            }).toThrow("Encountered Unmatched \"(\"");
        });

        test("Missing Operands", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"!",o);
            }).toThrow("Missing Right Operand: \"!\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"!!",o);
            }).toThrow("Missing Right Operand: \"!\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(!)",o);
            }).toThrow("Missing Right Operand: \"!\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(!)a",o);
            }).toThrow("Missing Right Operand: \"!\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"&a",o);
            }).toThrow("Missing Left Operand: \"&\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a&",o);
            }).toThrow("Missing Right Operand: \"&\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(&a)",o);
            }).toThrow("Missing Left Operand: \"&\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a&)",o);
            }).toThrow("Missing Right Operand: \"&\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"^a",o);
            }).toThrow("Missing Left Operand: \"^\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a^",o);
            }).toThrow("Missing Right Operand: \"^\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"|a",o);
            }).toThrow("Missing Left Operand: \"|\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a|",o);
            }).toThrow("Missing Right Operand: \"|\"");
        });

        test("No Operator", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputMap = new Map([
                ["a", a],
                ["b", b]
            ]);

            expect(() => {
                ExpressionToCircuit(inputMap,"a b",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a (b)",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a) b",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a !b",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"a()b",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a)(b)",o);
            }).toThrow("No valid operator between \"a\" and \"b\"");
            expect(() => {
                ExpressionToCircuit(inputMap,"(a|b)a",o);
            }).toThrow("No valid operator between \"b\" and \"a\"");
        });

        test("Empty Parenthesis", () => {
            const o = new LED();
            const inputMap = new Map();

            expect(() => {
                ExpressionToCircuit(inputMap,"()",o);
            }).toThrow("Empty Parenthesis");
            expect(() => {
                ExpressionToCircuit(inputMap,"( )",o);
            }).toThrow("Empty Parenthesis");
            expect(() => {
                ExpressionToCircuit(inputMap,"(())",o);
            }).toThrow("Empty Parenthesis");
            expect(() => {
                ExpressionToCircuit(inputMap,"()a|b",o);
            }).toThrow("Empty Parenthesis");
        });

        describe("Invalid ops", () => {
            const expression = "a | b ^ c & d | !(e & f)";
            
            test("Invalid |", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero | in supplied operation symbols");
            });
            test("Invalid ^", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ^ in supplied operation symbols");
            });
            test("Invalid &", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero & in supplied operation symbols");
            });
            test("Invalid !", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "",
                        "(": "(",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ! in supplied operation symbols");
            });
            test("Invalid (", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ( in supplied operation symbols");
            });
            test("Invalid )", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": "",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ) in supplied operation symbols");
            });
            test("Invalid separator", () => {
                const testOps: OperatorFormat = {
                    label: "Programming 1 (&, |, ^, !)",
                    separator: "",
                    icon: "|",
                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    }
                }
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero separator in supplied operation symbols");
            });
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
    });

    describe("1 Input", () => {
        runTests(1, "a", [false, true]);

        runTests(1, " a ", [false, true]);

        runTests(1, "(a)", [false, true]);

        runTests(1, " (  a ) ", [false, true]);

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

        runTests(1, "!a", [true, false]);

        runTests(1, "!!a", [false, true]);

        runTests(1, "!(!a)", [false, true]);

        runTests(1, "a&a", [false, true]);

        runTests(1, "a|a", [false, true]);

        runTests(1, "a^a", [false, false]);

        runTests(1, "a^!a", [true, true]);

        describe("Parse: 'longName'", () => {
            const a = new Switch(), o = new LED();
            const inputs: [string, Switch][] = [["longName", a]];
            const objectSet = ExpressionToCircuit(new Map(inputs), "longName", o);

            testInputs(inputs, objectSet, o, [false, true]);
        });
    });

    //0, a, b, (a, b)
    describe("2 Inputs", () => {
        runTests(2, "a&b", [false, false, false, true]);

        runTests(2, "a & b", [false, false, false, true]);

        runTests(2, "a^b", [false, true, true, false]);

        runTests(2, "a|b", [false, true, true, true]);

        runTests(2, "(a)|b", [false, true, true, true]);

        runTests(2, "!(a&b)", [true, true, true, false]);

        runTests(2, "!(!a|b)", [false, true, false, false]);

        runTests(2, "!a&b", [false, false, true, false]);

        runTests(2, "a&!b", [false, true, false, false]);

        runTests(2, "!a&!b", [true, false, false, false]);

        runTests(2, "!(a^b)", [true, false, false, true]);

        runTests(2, " ! ( a ^ b ) ", [true, false, false, true]);

        runTests(2, "!(a|b)", [true, false, false, false]);
    });

    //0, a, b, (a,b), c, (a,c), (b,c), (a,b,c)
    describe("3 Inputs", () => {
        runTests(3, "a&b&c", [false, false, false, false, false, false, false, true]);

        runTests(3, "a&b|c", [false, false, false, true, true, true, true, true]);

        runTests(3, "c|a&b", [false, false, false, true, true, true, true, true]);

        runTests(3, "a&(b|c)", [false, false, false, true, false, true, false, true]);

        runTests(3, "(a&((b)|c))", [false, false, false, true, false, true, false, true]);
    });

    describe("8 Inputs", () => {
        runTests(8, "a|b|c|d|e|f|g|h", [false, ...new Array(2**8 - 1).fill(true)]);
    });

    describe("Alternate Formats", () => {
        runTests(3, "a&&b&&c", [false, false, false, false, false, false, false, true], Formats[1]);
        
        runTests(3, "a*b*c", [false, false, false, false, false, false, false, true], Formats[2]);
        
        runTests(3, "a||b||c", [false, true, true, true, true, true, true, true], Formats[1]);
        
        runTests(3, "a+b+c", [false, true, true, true, true, true, true, true], Formats[2]);

        runTests(1, "_a", [true, false], Formats[3]);
    });

    describe("Generate Input Tree", () => {
        describe("!(a&b)", () => {
            const tokenA: InputToken = {type: "input", name: "a"};
            const tokenB: InputToken = {type: "input", name: "b"};
            const parenOpen: Token = {type: "("};
            const parenClose: Token = {type: ")"};
            const andToken: Token = {type: "&"};
            const notToken: Token = {type: "!"};
            const tokenList = [notToken, parenOpen, tokenA, andToken, tokenB, parenClose];
            const tree = GenerateInputTree(tokenList);
            const treeNot = tree as InputTreeUnOpNode;
            test("!", () => {
                expect(treeNot.kind).toBe("unop");
                expect(treeNot.type).toBe("!");
                expect(treeNot.child.kind).toBe("binop");
            });
            const treeAnd = treeNot.child as InputTreeBinOpNode;
            test("&", () => {
                expect(treeAnd.type).toBe("&");
                expect(treeAnd.lChild.kind).toBe("leaf");
                expect(treeAnd.rChild.kind).toBe("leaf");
            });
            const treeLeft = treeAnd.lChild as InputTreeIdent;
            test("a", () => {
                expect(treeLeft.ident).toBe("a");
            });
            const treeRight = treeAnd.rChild as InputTreeIdent;
            test("a", () => {
                expect(treeRight.ident).toBe("b");
            });
        });
        
        describe("!a", () => {
            const tokenA: InputToken = {type: "input", name: "a"};
            const notToken: Token = {type: "!"};
            const tokenList = [notToken, tokenA];
            const tree = GenerateInputTree(tokenList);
            const treeNot = tree as InputTreeUnOpNode;
            test("!", () => {
                expect(treeNot.kind).toBe("unop");
                expect(treeNot.type).toBe("!");
                expect(treeNot.child.kind).toBe("leaf");
            });
            const treeLeft = treeNot.child as InputTreeIdent;
            test("a", () => {
                expect(treeLeft.ident).toBe("a");
            });
        });
    });
});
