import {InputToken, InputTreeBinOpNode, InputTreeIdent,
        InputTreeUnOpNode, OperatorFormat,
        Token} from "site/digital/utils/ExpressionParser/Constants/DataStructures";


// import {FORMATS} from "site/digital/utils/ExpressionParser/Constants/Formats";

// import {AddGroup} from "core/actions/compositions/AddGroup";

// import {ExpressionToCircuit} from "site/digital/utils/ExpressionParser";

import {GenerateInputTree} from "site/digital/utils/ExpressionParser/GenerateInputTree";

import "../../../../../app/tests/Extensions";
import {ExpressionToCircuit} from "site/digital/utils/ExpressionParser";
import {DigitalCircuit}      from "digital/public";
import {GenerateTokens}      from "site/digital/utils/ExpressionParser/GenerateTokens";


// import {GenerateTokens}    from "site/digital/utils/ExpressionParser/GenerateTokens";

// import {DigitalCircuitDesigner} from "digital/models/DigitalCircuitDesigner";
// import {DigitalObjectSet}       from "digital/models/DigitalObjectSet";
// import {DigitalComponent}       from "digital/models/index";
// import "digital/models/ioobjects";

// import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
// import {ORGate}  from "digital/models/ioobjects/gates/ORGate";

// import {ConstantHigh} from "digital/models/ioobjects/inputs/ConstantHigh";
// import {ConstantLow}  from "digital/models/ioobjects/inputs/ConstantLow";
// import {Switch}       from "digital/models/ioobjects/inputs/Switch";

// import {LED} from "digital/models/ioobjects/outputs/LED";


// /**
//  * Gets the component that the first wire of the first output port of the supplied component is connected to.
//  *
//  * @param component The component whose output is wanted.
//  * @returns         The component that is the "first" connected from the supplied component.
//  */
// function getOutputComponent(component: DigitalComponent): DigitalComponent {
//     return component.getOutputPort(0).getWires()[0].getOutputComponent();
// }

// /**
//  * This function is used to create and run a separate test for every combination of switch states.
//  *
//  * For each test, switches are set to on or off based on a bitwise and operation of the index of that test
//  * in expected and 2 to the power of the index of the Switch in inputs. If the result is 0, then the switch
//  * will be off. If it is anything else, it will be on.
//  * For example, for a circuit with three Switches a, b, and c in inputs (in that order), expected[6] would
//  * have Switches enabled according to the following:
//  * (2**0 & 6) => 0 so Switch a will be off.
//  * (2**1 & 6) => 2 so Switch b will be on.
//  * (2**2 & 6) => 4 so Switch c will be on.
//  *
//  * Currently, jest runs the test in the opposite order of how they are given in the expected array.
//  * This is done to avoid an issue where circuits initial state is incorrect. This is likely due to
//  * the same underlying issue as issues #468 and #613 and if those are fixed, this function should
//  * also be modified.
//  *
//  * @param inputs   An array of the names of the switches along with their corresponding Switch,
//  *                 those same Switch objects must be present in circuit.
//  * @param circuit  The components and wires that make up the circuit being tested.
//  * @param output   The component whose state will be evaluated in the test, must be present in circuit.
//  * @param expected The expected states of the output LED for all the different switch combinations.
//  * @throws If the length of expected is not equal to 2 to the power of the length of inputs.
//  */
// function testInputs(inputs: Array<[string, Switch]>, circuit: DigitalObjectSet, output: LED, expected: boolean[]) {
//     if (2**inputs.length !== expected.length)
//         throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" +
//                         2**inputs.length + ")");

//     const designer = new DigitalCircuitDesigner(0);
//     AddGroup(designer, circuit);

//     // Decrements because there can be weird propagation issues when trying to read initial state
//     // For more, see issues #468 and #613
//     // TODO: Make this increment rather than decrement if/when #468 and #613 are fixed
//     for (let num = 2**inputs.length - 1; num >= 0; num--) {
//         let testTitle = "Inputs on:";
//         for (let index = 0; index < inputs.length; index++)
//             if (num & (2**index))
//                 testTitle += " " + inputs[index][0];
//         if (testTitle === "Inputs on:")
//             testTitle += " [none]";

//         // The loop is repeated because the activation needs to happen within the test
//         test(testTitle, () => {
//             for (let index = 0; index < inputs.length; index++)
//                 inputs[index][1].activate(!!(num & (2**index)));
//             expect(output.isOn()).toBe(expected[num]);
//         });
//     }
// }

/**
 * This function is similar to testInputs but only generates one test case rather than one for every state.
 *
 * @param inputs   An array of the names of the switches along with their corresponding Switch,
 *                 those same Switch objects must be present in circuit.
 * @param circuit  The components and wires that make up the circuit being tested.
 * @param output   The component whose state will be evaluated in the test, must be present in circuit.
 * @param expected The expected states of the output LED for all the different switch combinations.
 * @throws If the length of expected is not equal to 2 to the power of the length of inputs.
 * @see testInputs
 */
function testInputsSimple(inputs: Array<[string, Component]>, circuit: DigitalCircuit, output: string,
                          expected: boolean[]) {
    if (2 ** inputs.length !== expected.length)
        throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" +
                        2 ** inputs.length + ")");

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
 * By default, with numInputs<=3 then a test is created for each state, otherwise one test is created for the
 * entire expression.
 * This behavior can be overwritten with the verbose argument.
 *
 * @param numInputs  The number of switches that are used by this expression/test.
 * @param expression The logical boolean expression to test.
 * @param expected   The expected states of the output LED for all the different switch combinations
 *                   (see testInputs for order).
 * @param ops        The strings used to represent the different operators.
 * @param verbose    True to force creating a new test for every state, false to force creating one single test
 *                   encompassing all states.
 * @throws If numInputs > 8.
 * @throws If the length of expected is not equal to 2 to the power of the length of inputs.
 * @see testInputs
 * @see ExpressionToCircuit
 */
function runTests(numInputs: number, expression: string, expected: boolean[], ops?: OperatorFormat, verbose?: boolean) {
    describe("Parse: '" + expression + "'", () => {
        if (numInputs > 8)
            throw new Error("Maximum supported number of inputs is 8, you tried to use " + numInputs);

        const o = "LED";
        const inputs: Array<[string, string]> = [];
        const charCodeStart = "a".codePointAt(0)!;
        for (let i = 0; i < numInputs; i++)
            inputs.push([String.fromCodePoint(charCodeStart+i), "Switch"]);

        const result = ExpressionToCircuit(new Map(inputs), expression, o, ops);
        // If I understand Jest correctly, this test will run after the non-test-blocked code after it,
        // including the unwrap. So this may not actually be useful?
        test("Expression To Circuit Generation didn't error", () => {
            expect(result).toBeOk();
        });
        const circuit = result.unwrap();
        for (let i = 0; i < numInputs; i++) {
            const code = String.fromCodePoint(charCodeStart+i);
            // TODO[.](trevor) Improve this when API is improved
            const comp = circuit.getObjs().find((o) => (o.name === code));
        }

        // if (verbose === false || (verbose === undefined && numInputs > 3))
        //     testInputsSimple(inputs, circuit, o, expected);
        // else
        //     testInputs(inputs, objectSet, o, expected);
    });
}

describe("Expression Parser", () => {
    describe("Invalid Inputs", () => {
        test("Input Not Found", () => {
            const a = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
            ]);

            expect(ExpressionToCircuit(inputMap,"b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a|b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"!b",o)).not.toBeOk();
        });

        test("Unmatched '(' and ')'", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);
            const inputMap2 = new Map();

            expect(ExpressionToCircuit(inputMap,"(",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"!(",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a|b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"((a|b)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,")",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a|b)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a|b))",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,")a|b(",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,")(",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap2,"(",o)).not.toBeOk();
        });

        test("Missing Operands", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);

            expect(ExpressionToCircuit(inputMap,"!",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"!!",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(!)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(!)a",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"&a",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a&",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(&a)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a&)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"^a",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a^",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"|a",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a|",o)).not.toBeOk();
        });

        test("No Operator", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);

            expect(ExpressionToCircuit(inputMap,"a b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a (b)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a) b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a !b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"a()b",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a)(b)",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(a|b)a",o)).not.toBeOk();
        });

        test("Empty Parenthesis", () => {
            const o = "LED";
            const inputMap = new Map();

            expect(ExpressionToCircuit(inputMap,"()",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"( )",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"(())",o)).not.toBeOk();
            expect(ExpressionToCircuit(inputMap,"()a|b",o)).not.toBeOk();
        });

        describe("Invalid ops", () => {
            const expression = "a | b ^ c & d | !(e & f)";

            test("Invalid |", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid ^", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid &", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid !", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "",
                        "(": "(",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid (", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid )", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: " ",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": "",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
            test("Invalid separator", () => {
                const testOps: OperatorFormat = {
                    label:     "Programming 1 (&, |, ^, !)",
                    separator: "",
                    icon:      "|",

                    ops: {
                        "|": "|",
                        "^": "^",
                        "&": "&",
                        "!": "!",
                        "(": "(",
                        ")": ")",
                    },
                }
                expect(GenerateTokens(expression, testOps)).not.toBeOk();
            });
        });

        test("Parse: ''", () => {
            const o = "LED";
            const inputMap = new Map<string, string>();

            const result = ExpressionToCircuit(inputMap, "", o);
            expect(result).not.toBeOk();
        });
        test("Parse: ' '", () => {
            const o = "LED";
            const inputMap = new Map<string, string>();

            const result = ExpressionToCircuit(inputMap, " ", o);
            expect(result).not.toBeOk();
        });
    });

    describe("1 Input", () => {
        runTests(1, "a", [false, true]);

        runTests(1, " a ", [false, true]);

        runTests(1, "(a)", [false, true]);

        runTests(1, " (  a ) ", [false, true]);

        // describe("Parse: 'a' (ConstantHigh)", () => {
        //     const a = "ConstantHigh", o = "LED";
        //     const inputMap = new Map([
        //         ["a", a],
        //     ]);

        //     const result = ExpressionToCircuit(inputMap, "a", o);

        //     test("Initial State", () => {
        //         expect(result).toBeOk();
        //         const circuit = result.unwrap();
        //         expect(o.isOn()).toBe(true);
        //     });
        // });

        // describe("Parse: 'a' (ConstantLow)", () => {
        //     const a = "ConstantLow", o = "LED";
        //     const inputMap = new Map([
        //         ["a", a],
        //     ]);

        //     const result = ExpressionToCircuit(inputMap, "a", o);

        //     test("Initial State", () => {
        //         expect(result).toBeOk();
        //         const circuit = result.unwrap();
        //         expect(o.isOn()).toBe(false);
        //     });
        // });

        runTests(1, "!a", [true, false]);

        runTests(1, "!!a", [false, true]);

        runTests(1, "!(!a)", [false, true]);

        runTests(1, "a&a", [false, true]);

        runTests(1, "a|a", [false, true]);

        runTests(1, "a^a", [false, false]);

        runTests(1, "a^!a", [true, true]);

        // describe("Parse: 'longName'", () => {
        //     const a = "Switch", o = "LED";
        //     const inputs: ReadonlyArray<[string, string]> = [["longName", a]];
        //     const objectSet = ExpressionToCircuit(new Map(inputs), "longName", o);

        //     testInputs(inputs, objectSet, o, [false, true]);
        // });
    });

    // // 0, a, b, (a, b)
    // describe("2 Inputs", () => {
    //     runTests(2, "a&b", [false, false, false, true]);

    //     runTests(2, "a & b", [false, false, false, true]);

    //     runTests(2, "a^b", [false, true, true, false]);

    //     runTests(2, "a|b", [false, true, true, true]);

    //     runTests(2, "(a)|b", [false, true, true, true]);

    //     runTests(2, "!(a&b)", [true, true, true, false]);

    //     runTests(2, "!(!a|b)", [false, true, false, false]);

    //     runTests(2, "!a&b", [false, false, true, false]);

    //     runTests(2, "a&!b", [false, true, false, false]);

    //     runTests(2, "!a&!b", [true, false, false, false]);

    //     runTests(2, "!(a^b)", [true, false, false, true]);

    //     runTests(2, " ! ( a ^ b ) ", [true, false, false, true]);

    //     runTests(2, "!(a|b)", [true, false, false, false]);
    // });

    // // 0, a, b, (a,b), c, (a,c), (b,c), (a,b,c)
    // describe("3 Inputs", () => {
    //     runTests(3, "a&b&c", [false, false, false, false, false, false, false, true]);

    //     runTests(3, "a&b|c", [false, false, false, true, true, true, true, true]);

    //     runTests(3, "c|a&b", [false, false, false, true, true, true, true, true]);

    //     runTests(3, "a&(b|c)", [false, false, false, true, false, true, false, true]);

    //     runTests(3, "(a&((b)|c))", [false, false, false, true, false, true, false, true]);
    // });

    // describe("8 Inputs", () => {
    //     runTests(8, "a|b|c|d|e|f|g|h", [false, ...new Array(2**8 - 1).fill(true)]);
    // });

    // describe("Alternate Formats", () => {
    //     runTests(3, "a&&b&&c", [false, false, false, false, false, false, false, true], FORMATS[1]);

    //     runTests(3, "a*b*c", [false, false, false, false, false, false, false, true], FORMATS[2]);

    //     runTests(3, "a||b||c", [false, true, true, true, true, true, true, true], FORMATS[1]);

    //     runTests(3, "a+b+c", [false, true, true, true, true, true, true, true], FORMATS[2]);

    //     runTests(1, "_a", [true, false], FORMATS[3]);
    // });

    // describe("Binary gate variants", () => {
    //     describe("7 variable OR", () => {
    //         const o = "LED";
    //         const inputs: Array<[string, Switch]> = [];
    //         const charCodeStart = "a".codePointAt(0)!;
    //         for (let i = 0; i < 7; i++)
    //             inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

    //         const objectSet = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g", o);

    //         test("Correct number of components", () => {
    //             expect(objectSet.getComponents()).toHaveLength(9);
    //         });

    //         test("Correct connections", () => {
    //             const bigGate = getOutputComponent(inputs[0][1]);
    //             for (let i = 1; i < 7; i++)
    //                 expect(getOutputComponent(inputs[i][1])).toBe(bigGate);
    //         });
    //     });

    //     describe("8 variable OR", () => {
    //         const o = "LED";
    //         const inputs: Array<[string, Switch]> = [];
    //         const charCodeStart = "a".codePointAt(0)!;
    //         for (let i = 0; i < 8; i++)
    //             inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

    //         const objectSet = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g|h", o);

    //         test("Correct number of components", () => {
    //             expect(objectSet.getComponents()).toHaveLength(10);
    //         });

    //         test("Correct connections", () => {
    //             const bigGate = getOutputComponent(inputs[0][1]);
    //             for (let i = 1; i < 8; i++)
    //                 expect(getOutputComponent(inputs[i][1])).toBe(bigGate);
    //         });
    //     });

    //     describe("9 variable OR", () => {
    //         const o = "LED";
    //         const inputs: Array<[string, Switch]> = [];
    //         const charCodeStart = "a".codePointAt(0)!;
    //         for (let i = 0; i < 9; i++)
    //             inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

    //         const objectSet = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g|h|i", o);

    //         test("Correct number of components", () => {
    //             expect(objectSet.getComponents()).toHaveLength(12);
    //         });

    //         test("Correct connections", () => {
    //             const bigGate = getOutputComponent(inputs[0][1]);
    //             for (let i = 1; i < 7; i++)
    //                 expect(getOutputComponent(inputs[i][1])).toBe(bigGate);
    //             // Doesn't matter if input 8 is connected to bigGate or the other or gate
    //             expect(getOutputComponent(inputs[8][1])).not.toBe(bigGate);
    //         });
    //     });

    //     describe("(a|b)|(c|d)", () => {
    //         const o = "LED";
    //         const inputs: Array<[string, Switch]> = [];
    //         const charCodeStart = "a".codePointAt(0)!;
    //         for (let i = 0; i < 4; i++)
    //             inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

    //         const objectSet = ExpressionToCircuit(new Map(inputs), "(a|b)|(c|d)", o);

    //         test("Correct number of components", () => {
    //             expect(objectSet.getComponents()).toHaveLength(8);
    //         });

    //         test("Correct connections", () => {
    //             const gate1 = getOutputComponent(inputs[1][1]);
    //             const gate2 = getOutputComponent(inputs[3][1]);
    //             expect(getOutputComponent(inputs[0][1])).toBe(gate1);
    //             expect(getOutputComponent(inputs[2][1])).toBe(gate2);
    //             expect(gate1).not.toBe(gate2);
    //             expect(getOutputComponent(gate1)).toBe(getOutputComponent(gate2));
    //         });
    //     });

    //     describe("!(a|b|c)", () => {
    //         const o = "LED";
    //         const inputs: Array<[string, Switch]> = [];
    //         const charCodeStart = "a".codePointAt(0)!;
    //         for (let i = 0; i < 3; i++)
    //             inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

    //         const objectSet = ExpressionToCircuit(new Map(inputs), "!(a|b|c)", o);

    //         test("Correct number of components", () => {
    //             expect(objectSet.getComponents()).toHaveLength(5);
    //         });

    //         test("Correct connections", () => {
    //             const gate = getOutputComponent(inputs[0][1]);
    //             expect(getOutputComponent(inputs[0][1])).toBe(gate);
    //             expect(getOutputComponent(inputs[1][1])).toBe(gate);
    //         });
    //     });
    // });

    describe("Generate Input Tree", () => {
        test("!(a&b)", () => {
            const tokenA: InputToken = { type: "input", name: "a" };
            const tokenB: InputToken = { type: "input", name: "b" };
            const parenOpen: Token = { type: "(" };
            const parenClose: Token = { type: ")" };
            const andToken: Token = { type: "&" };
            const notToken: Token = { type: "!" };
            const tokenList = [notToken, parenOpen, tokenA, andToken, tokenB, parenClose];
            const tree = GenerateInputTree(tokenList);
            expect(tree).toBeOk();
            const treeNand = tree.unwrap() as InputTreeBinOpNode;
            expect(treeNand.kind).toBe("binop");
            expect(treeNand.isNot).toBeTruthy();
            expect(treeNand.children[0].kind).toBe("leaf");
            expect(treeNand.children[1].kind).toBe("leaf");
            const treeLeft = treeNand.children[0] as InputTreeIdent;
            expect(treeLeft.ident).toBe("a");
            const treeRight = treeNand.children[1] as InputTreeIdent;
            expect(treeRight.ident).toBe("b");
        });

        test("!a", () => {
            const tokenA: InputToken = { type: "input", name: "a" };
            const notToken: Token = { type: "!" };
            const tokenList = [notToken, tokenA];
            const tree = GenerateInputTree(tokenList);
            const treeNot = tree.unwrap() as InputTreeUnOpNode;
            expect(treeNot.kind).toBe("unop");
            expect(treeNot.type).toBe("!");
            expect(treeNot.child.kind).toBe("leaf");
            const treeLeft = treeNot.child as InputTreeIdent;
            expect(treeLeft.ident).toBe("a");
        });
    });
});
