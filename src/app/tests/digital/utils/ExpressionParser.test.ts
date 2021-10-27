import "jest";

import { DigitalCircuitDesigner } from "digital/models/DigitalCircuitDesigner";
import { Switch } from "digital/models/ioobjects/inputs/Switch";
import { ConstantHigh } from "digital/models/ioobjects/inputs/ConstantHigh";
import { ConstantLow } from "digital/models/ioobjects/inputs/ConstantLow";
import { ANDGate } from "digital/models/ioobjects/gates/ANDGate";
import { ORGate } from "digital/models/ioobjects/gates/ORGate";
import { NOTGate } from "digital/models/ioobjects/gates/BUFGate";
import { LED } from "digital/models/ioobjects/outputs/LED";
import { DigitalComponent } from "digital/models/index";
import { DigitalObjectSet } from "digital/utils/ComponentUtils";
import { IOObject } from "core/models/IOObject";

import { ExpressionToCircuit } from "digital/utils/ExpressionParser";
import { FormatMap, Token, InputToken, InputTreeIdent, InputTreeBinOpNode, InputTreeUnOpNode, FormatLabels } from "digital/utils/ExpressionParser/Constants";
import { GenerateInputTree } from "digital/utils/ExpressionParser/GenerateInputTree";
import { GenerateTokens } from "digital/utils/ExpressionParser/GenerateTokens";
import { ConnectGate } from "digital/utils/ExpressionParser/Utils";


function testInputs(inputs: [string, Switch][], circuit: DigitalObjectSet, output: LED, expected: boolean[]) {
    if (2**inputs.length !== expected.length)
        throw new Error("The number of expected states does not match the expected amount");

    const designer = new DigitalCircuitDesigner(0);
    designer.addGroup(circuit);

    // Decrements because there can be weird propagation issues when trying to read initial state
    // For more, see issues #468 and #613
    for (let num = 2**inputs.length - 1; num >= 0; num--) {
        let testTitle = "Inputs on:";
        for (let index = 0; index < inputs.length; index++)
            if(num & (2**index))
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

function runTests(numInputs: number, expression: string, expected: boolean[], ops?: Map<FormatLabels, string>) {
    describe("Parse: '" + expression + "'", () => {
        if (numInputs > 26)
            throw new Error("Maximum supported number of inputs is 26, you tried to use " + numInputs);

        const o = new LED();
        const inputs: [string, Switch][] = [];
        const charCodeStart = "a".charCodeAt(0);
        for (let i = 0; i < numInputs; i++)
            inputs.push([String.fromCharCode(charCodeStart+i), new Switch()]);

        const objectSet = ExpressionToCircuit(new Map(inputs), expression, o, ops);

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
            test("No |", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No | in supplied operation symbols");
            });
            test("No ^", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No ^ in supplied operation symbols");
            });
            test("No &", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No & in supplied operation symbols");
            });
            test("No !", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No ! in supplied operation symbols");
            });
            test("No (", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No ( in supplied operation symbols");
            });
            test("No )", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No ) in supplied operation symbols");
            });
            test("No separator", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("No separator in supplied operation symbols");
            });
            
            test("Invalid |", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", ""],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero | in supplied operation symbols");
            });
            test("Invalid ^", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", ""],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ^ in supplied operation symbols");
            });
            test("Invalid &", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", ""],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero & in supplied operation symbols");
            });
            test("Invalid !", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", ""],
                        ["(", "("],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ! in supplied operation symbols");
            });
            test("Invalid (", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", ""],
                        [")", ")"],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ( in supplied operation symbols");
            });
            test("Invalid )", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ""],
                        ["separator", " "]
                ]);
                expect(() => {
                    GenerateTokens(expression, testOps);
                }).toThrow("Length zero ) in supplied operation symbols");
            });
            test("Invalid separator", () => {
                const testOps = new Map<FormatLabels, string>([
                        ["label", "Programming 1 (&, |, ^, !)"],
                        ["|", "|"],
                        ["^", "^"],
                        ["&", "&"],
                        ["!", "!"],
                        ["(", "("],
                        [")", ")"],
                        ["separator", ""]
                ]);
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

    describe("Alternate Formats", () => {
        runTests(3, "a&&b&&c", [false, false, false, false, false, false, false, true], FormatMap.get("||"));
        
        runTests(3, "a*b*c", [false, false, false, false, false, false, false, true], FormatMap.get("+"));
        
        runTests(3, "a||b||c", [false, true, true, true, true, true, true, true], FormatMap.get("||"));
        
        runTests(3, "a+b+c", [false, true, true, true, true, true, true, true], FormatMap.get("+"));

        runTests(1, "_a", [true, false], FormatMap.get("+_"));
    });

    describe("Simplification", () => {
        describe("Parse and Condense: '!(a|b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputs: [string, Switch][] = [["a", a], ["b", b]];
            const objectSet = ExpressionToCircuit(new Map(inputs), "!(a|b)", o);

            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });

            testInputs(inputs, objectSet, o, [true, false, false, false]);
        });
        
        describe("Parse and Condense: '!(a^b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputs: [string, Switch][] = [["a", a], ["b", b]];
            const objectSet = ExpressionToCircuit(new Map(inputs), "!(a^b)", o);

            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });
        
            testInputs(inputs, objectSet, o, [true, false, false, true]);
        });
        
        describe("Parse and Condense: '!(a&b)'", () => {
            const a = new Switch(), b = new Switch(), o = new LED();
            const inputs: [string, Switch][] = [["a", a], ["b", b]];
            const objectSet = ExpressionToCircuit(new Map(inputs), "!(a&b)", o);

            test("Condense to NOR", () => {
                expect(objectSet.getComponents().length).toBe(4);
            });

            testInputs(inputs, objectSet, o, [true, true, true, false]);
        });
    });

    describe("Connect Gate", () => {
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

            test("Correct number of things", () => {
                expect(objects.length).toBe(9);
            });

            testInputs([["a", a], ["b", b]], new DigitalObjectSet(objects), o, [true, true, true, false]);
        });
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
