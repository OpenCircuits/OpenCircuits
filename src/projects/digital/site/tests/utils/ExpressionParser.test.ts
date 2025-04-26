import "shared/tests/helpers/Extensions";
import {InputToken, InputTreeBinOpNode, InputTreeIdent,
        InputTreeUnOpNode, OperatorFormat,
        Token} from "digital/site/utils/ExpressionParser/Constants/DataStructures";

import {GenerateInputTree} from "digital/site/utils/ExpressionParser/GenerateInputTree";

import {ExpressionToCircuit} from "digital/site/utils/ExpressionParser";
import {GenerateTokens}      from "digital/site/utils/ExpressionParser/GenerateTokens";
import {FORMATS}             from "digital/site/utils/ExpressionParser/Constants/Formats";
import {Signal} from "digital/api/circuit/internal/sim/Signal";
import {DigitalComponent} from "digital/api/circuit/public/DigitalComponent";
import {DigitalSim} from "digital/api/circuit/internal/sim/DigitalSim";
import {InstantSimRunner} from "digital/api/circuit/internal/sim/DigitalSimRunner";


/**
 * This function is used to create and run a separate test for every combination of switch states.
 *
 * For each test, switches are set to on or off based on a bitwise and operation of the index of that test
 * in expected and 2 to the power of the index of the Switch in inputs. If the result is 0, then the switch
 * will be off. If it is anything else, it will be on.
 * For example, for a circuit with three Switches a, b, and c in inputs (in that order), expected[6] would
 * have Switches enabled according to the following:
 * (2**0 & 6) => 0 so Switch a will be off.
 * (2**1 & 6) => 2 so Switch b will be on.
 * (2**2 & 6) => 4 so Switch c will be on.
 *
 * Currently, jest runs the test in the opposite order of how they are given in the expected array.
 * This is done to avoid an issue where circuits initial state is incorrect. This is likely due to
 * the same underlying issue as issues #468 and #613 and if those are fixed, this function should
 * also be modified.
 *
 * @param inputs   An array of the names of the switches along with their corresponding Switch,
 *                 those same Switch objects must be present in circuit.
 * @param output   The component whose state will be evaluated in the test, must be present in circuit.
 * @param expected The expected states of the output LED for all the different switch combinations.
 * @param sim      The sim instance used to turn inputs on or off.
 * @throws If the length of expected is not equal to 2 to the power of the length of inputs.
 */
function testInputs(inputs: Array<[string, DigitalComponent]>, output: DigitalComponent, expected: boolean[], sim: DigitalSim) {
    if (2**inputs.length !== expected.length)
        throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" +
                        2**inputs.length + ")");

    for (let num = 0; num < 2**inputs.length; num++) {
        let testTitle = "Inputs on:";
        for (let index = 0; index < inputs.length; index++)
            if (num & (2**index))
                testTitle += " " + inputs[index][0];
        if (testTitle === "Inputs on:")
            testTitle += " [none]";

        // The loop is repeated because the activation needs to happen within the test
        test(testTitle, () => {
            for (const [index, input] of inputs.entries())
                sim.setState(input[1].id, [num & (2**index) ? Signal.On : Signal.Off]);
            expect(output.inputs[0].signal).toBe(expected[num] ? Signal.On : Signal.Off);
        });
    }
}

/**
 * This function is similar to testInputs but only generates one test case rather than one for every state.
 *
 * @param inputs   An array of the names of the switches along with their corresponding Switch,
 *                 those same Switch objects must be present in circuit.
 * @param output   The component whose state will be evaluated in the test, must be present in circuit.
 * @param expected The expected states of the output LED for all the different switch combinations.
 * @param sim      The sim instance used to turn inputs on or off.
 * @throws If the length of expected is not equal to 2 to the power of the length of inputs.
 * @see testInputs
 */
function testInputsSimple(inputs: Array<[string, DigitalComponent]>, output: DigitalComponent, expected: boolean[], sim: DigitalSim) {
    if (2 ** inputs.length !== expected.length)
        throw new Error("The number of expected states (" + expected.length + ") does not match the expected amount (" +
                        2 ** inputs.length + ")");

    test("Test all states", () => {
        for (let num = 0; num < 2**inputs.length; num++) {
            for (const [index, input] of inputs.entries())
                sim.setState(input[1].id, [num & (2**index) ? Signal.On : Signal.Off]);
            expect(output.inputs[0].signal).toBe(expected[num] ? Signal.On : Signal.Off);
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
        const inputs: Array<[string, "Switch"]> = [];
        const charCodeStart = "a".codePointAt(0)!;
        for (let i = 0; i < numInputs; i++)
            inputs.push([String.fromCodePoint(charCodeStart+i), "Switch"]);

        const result = ExpressionToCircuit(new Map(inputs), expression, o, ops);
        // If I understand Jest correctly, this test will run after the non-test-blocked code after it,
        // including the unwrap. So this may not actually be useful?
        test("Expression To Circuit Generation didn't error", () => {
            expect(result).toBeOk();
        });
        const { circuit, state } = result.unwrap();
        state.simRunner = new InstantSimRunner(state.sim);

        const inputComponents: Array<[string, DigitalComponent]> = [];
        for (let i = 0; i < numInputs; i++) {
            const code = String.fromCodePoint(charCodeStart+i);
            // TODO[.](trevor) Improve this when API is improved
            const comp = circuit.getComponents().find((o) => (o.name === code));
            if (!comp) {
                throw new Error(`Input with name ${code} not found in generated circuit`);
            }
            inputComponents.push([code, comp]);
        }
        const outputComp = circuit.getComponents().find((o) => (o.name === "Output"));
        if (!outputComp) {
            throw new Error("Output with name Output not found in generated circuit");
        }

        if (verbose === false || (verbose === undefined && numInputs > 3))
            testInputsSimple(inputComponents, outputComp, expected, state.sim);
        else
            testInputs(inputComponents, outputComp, expected, state.sim);
    });
}

describe("Expression Parser", () => {
    describe("Invalid Inputs", () => {
        test("Unmatched '(' and ')'", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);
            const inputMap2 = new Map();

            expect(ExpressionToCircuit(inputMap, "(", o)).toIncludeError("Encountered Unmatched \"(\"");
            expect(ExpressionToCircuit(inputMap,"!(",o)).toIncludeError("Encountered Unmatched \"(\"");
            expect(ExpressionToCircuit(inputMap,"(a|b",o)).toIncludeError("Encountered Unmatched \"(\"");
            expect(ExpressionToCircuit(inputMap,"((a|b)",o)).toIncludeError("Encountered Unmatched \"(\"");
            expect(ExpressionToCircuit(inputMap,")",o)).toIncludeError("Encountered Unmatched \")\"");
            expect(ExpressionToCircuit(inputMap,"a|b)",o)).toIncludeError("Encountered Unmatched \")\"");
            expect(ExpressionToCircuit(inputMap,"(a|b))",o)).toIncludeError("Encountered Unmatched \")\"");
            expect(ExpressionToCircuit(inputMap,")a|b(",o)).toIncludeError("Encountered Unmatched \")\"");
            expect(ExpressionToCircuit(inputMap,")(",o)).toIncludeError("Encountered Unmatched \")\"");
            expect(ExpressionToCircuit(inputMap2,"(",o)).toIncludeError("Encountered Unmatched \"(\"");
        });

        test("Missing Operands", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);

            expect(ExpressionToCircuit(inputMap, "!", o))
                .toIncludeError("Missing Right Operand: \"!\"");
            expect(ExpressionToCircuit(inputMap,"!!",o))
                .toIncludeError("Missing Right Operand: \"!\"");
            expect(ExpressionToCircuit(inputMap,"(!)",o))
                .toIncludeError("Invalid token \")\" following \"!\"");
            expect(ExpressionToCircuit(inputMap,"(!)a",o))
                .toIncludeError("Invalid token \")\" following \"!\"");
            expect(ExpressionToCircuit(inputMap,"&a",o))
                .toIncludeError("Missing Left Operand: \"&\"");
            expect(ExpressionToCircuit(inputMap,"a&",o))
                .toIncludeError("Missing Right Operand: \"&\"");
            expect(ExpressionToCircuit(inputMap,"(&a)",o))
                .toIncludeError("Missing Left Operand: \"&\"");
            expect(ExpressionToCircuit(inputMap,"(a&)",o))
                .toIncludeError("Missing Right Operand: \"&\"");
            expect(ExpressionToCircuit(inputMap,"^a",o))
                .toIncludeError("Missing Left Operand: \"^\"");
            expect(ExpressionToCircuit(inputMap,"a^",o))
                .toIncludeError("Missing Right Operand: \"^\"");
            expect(ExpressionToCircuit(inputMap,"|a",o))
                .toIncludeError("Missing Left Operand: \"|\"");
            expect(ExpressionToCircuit(inputMap,"a|",o))
                .toIncludeError("Missing Right Operand: \"|\"");
        });

        test("No Operator", () => {
            const a = "Switch", b = "Switch", o = "LED";
            const inputMap = new Map([
                ["a", a],
                ["b", b],
            ]);

            expect(ExpressionToCircuit(inputMap,"a b",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"a (b)",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"(a) b",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"a !b",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"a()b",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"(a)(b)",o))
                .toIncludeError("No valid operator between \"a\" and \"b\"");
            expect(ExpressionToCircuit(inputMap,"(a|b)a",o))
                .toIncludeError("No valid operator between \"b\" and \"a\"");
        });

        test("Empty Parenthesis", () => {
            const o = "LED";
            const inputMap = new Map();

            expect(ExpressionToCircuit(inputMap,"()",o)).toIncludeError("Empty Parenthesis");
            expect(ExpressionToCircuit(inputMap,"( )",o)).toIncludeError("Empty Parenthesis");
            expect(ExpressionToCircuit(inputMap,"(())",o)).toIncludeError("Empty Parenthesis");
            expect(ExpressionToCircuit(inputMap,"()a|b",o)).toIncludeError("Empty Parenthesis");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero | in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero ^ in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero & in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero ! in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero ( in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero ) in supplied operation symbols");
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
                expect(GenerateTokens(expression, testOps))
                    .toIncludeError("Length zero separator in supplied operation symbols");
            });
        });

        test("Parse: ''", () => {
            const o = "LED";
            const inputMap = new Map<string, string>();

            const result = ExpressionToCircuit(inputMap, "", o);
            expect(result).toIncludeError("Empty Input");
        });
        test("Parse: ' '", () => {
            const o = "LED";
            const inputMap = new Map<string, string>();

            const result = ExpressionToCircuit(inputMap, " ", o);
            expect(result).toIncludeError("Empty Input");
        });
    });

    describe("1 Input", () => {
        runTests(1, "a", [false, true]);

        runTests(1, " a ", [false, true]);

        runTests(1, "(a)", [false, true]);

        runTests(1, " (  a ) ", [false, true]);

        runTests(1, "!a", [true, false]);

        runTests(1, "!!a", [false, true]);

        runTests(1, "!(!a)", [false, true]);

        runTests(1, "a&a", [false, true]);

        runTests(1, "a|a", [false, true]);

        runTests(1, "a^a", [false, false]);

        runTests(1, "a^!a", [true, true]);

        test("Parse: 'a' (ConstantHigh)", () => {
            const a = "ConstantHigh", o = "LED";
            const inputMap = new Map([
                ["a", a],
            ]);

            const result = ExpressionToCircuit(inputMap, "a", o);
            expect(result).toBeOk();
            const { circuit, state } = result.unwrap();
            state.simRunner = new InstantSimRunner(state.sim);

            const output = circuit.getComponents().find((comp) => comp.kind === "LED");
            expect(output).toBeDefined();
            expect(output!.inputs[0].signal).toBe(Signal.On);
        });

        test("Parse: 'a' (ConstantLow)", () => {
            const a = "ConstantLow", o = "LED";
            const inputMap = new Map([
                ["a", a],
            ]);

            const result = ExpressionToCircuit(inputMap, "a", o);
            const { circuit, state } = result.unwrap();
            state.simRunner = new InstantSimRunner(state.sim);

            const output = circuit.getComponents().find((comp) => comp.kind === "LED");
            expect(output).toBeDefined();
            expect(output!.inputs[0].signal).toBe(Signal.Off);
        });

        describe("Parse: 'longName'", () => {
            const a = "Switch", o = "LED";
            const inputs: ReadonlyArray<[string, string]> = [["longName", a]];
            const result = ExpressionToCircuit(new Map(inputs), "longName", o);
            test("Result is ok", () => {
                expect(result).toBeOk();
            });
            const { circuit, state } = result.unwrap();
            state.simRunner = new InstantSimRunner(state.sim);

            const inputComp = circuit.getComponents().find((o) => (o.name === "longName"));
            test("Input component found", () => {
                expect(inputComp).toBeDefined();
            });
            const inputComponents: Array<[string, DigitalComponent]> = [["longName", inputComp!]];
            const outputComp = circuit.getComponents().find((o) => (o.name === "Output"));
            test("Output component found", () => {
                expect(outputComp).toBeDefined();
            });

            testInputs(inputComponents, outputComp!, [false, true], state.sim);
        });
    });

    // // 0, a, b, (a, b)
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

    // 0, a, b, (a,b), c, (a,c), (b,c), (a,b,c)
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
        runTests(3, "a&&b&&c", [false, false, false, false, false, false, false, true], FORMATS[1]);

        runTests(3, "a*b*c", [false, false, false, false, false, false, false, true], FORMATS[2]);

        runTests(3, "a||b||c", [false, true, true, true, true, true, true, true], FORMATS[1]);

        runTests(3, "a+b+c", [false, true, true, true, true, true, true, true], FORMATS[2]);

        runTests(1, "_a", [true, false], FORMATS[3]);
    });

    describe("Binary gate variants", () => {
        test("7 variable OR", () => {
            const o = "LED";
            const inputs: Array<[string, string]> = [];
            const charCodeStart = "a".codePointAt(0)!;
            for (let i = 0; i < 7; i++)
                inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

            const result = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g", o);
            expect(result).toBeOk();
            const { circuit } = result.unwrap();

            expect(circuit.getComponents()).toHaveLength(9);
        });

        test("8 variable OR", () => {
            const o = "LED";
            const inputs: Array<[string, string]> = [];
            const charCodeStart = "a".codePointAt(0)!;
            for (let i = 0; i < 8; i++)
                inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

            const result = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g|h", o);
            expect(result).toBeOk();
            const { circuit } = result.unwrap();

            expect(circuit.getComponents()).toHaveLength(10);
        });

        test("9 variable OR", () => {
            const o = "LED";
            const inputs: Array<[string, string]> = [];
            const charCodeStart = "a".codePointAt(0)!;
            for (let i = 0; i < 9; i++)
                inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

            const result = ExpressionToCircuit(new Map(inputs), "a|b|c|d|e|f|g|h|i", o);
            expect(result).toBeOk();
            const { circuit } = result.unwrap();

            expect(circuit.getComponents()).toHaveLength(12);
        });

        test("(a|b)|(c|d)", () => {
            const o = "LED";
            const inputs: Array<[string, string]> = [];
            const charCodeStart = "a".codePointAt(0)!;
            for (let i = 0; i < 4; i++)
                inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

            const result = ExpressionToCircuit(new Map(inputs), "(a|b)|(c|d)", o);
            expect(result).toBeOk();
            const { circuit } = result.unwrap();

            expect(circuit.getComponents()).toHaveLength(8);
        });

        test("!(a|b|c)", () => {
            const o = "LED";
            const inputs: Array<[string, string]> = [];
            const charCodeStart = "a".codePointAt(0)!;
            for (let i = 0; i < 3; i++)
                inputs.push([String.fromCodePoint(charCodeStart + i), "Switch"]);

            const result = ExpressionToCircuit(new Map(inputs), "!(a|b|c)", o);
            expect(result).toBeOk();
            const { circuit } = result.unwrap();

            expect(circuit.getComponents()).toHaveLength(5);
        });
    });

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
