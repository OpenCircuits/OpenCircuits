import {IOObject} from "core/models/IOObject";
import {DigitalComponent} from "digital/models/index";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {OutputPort} from "digital/models/ports/OutputPort";
import {Gate} from "digital/models/ioobjects/gates/Gate";
import {ANDGate, NANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate, NORGate} from "digital/models/ioobjects/gates/ORGate";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {XORGate, XNORGate} from "digital/models/ioobjects/gates/XORGate";
import {DigitalWire} from "digital/models/DigitalWire";
import {FormatMap, TokenType} from "./ExpressionParserConstants";
import { Console } from "console";
import { Graph } from "math/Graph";
import { Input } from "core/utils/Input";
import { InputType } from "zlib";


/* Notes for connecting components
    const designer = new DigitalCircuitDesigner(0);
    const a = new Switch(), b = new Switch(), o = new LED(), and_gate = new ANDGate();
    const w1 = new DigitalWire(a.getOutputPort(0), and_gate.getInputPort(0));
    const w2 = new DigitalWire(b.getOutputPort(0), and_gate.getInputPort(1));
    const w3 = new DigitalWire(and_gate.getOutputPort(0), o.getInputPort(0));

    a.getOutputPort(0).connect(w1);
    and_gate.getInputPort(0).connect(w1);

    b.getOutputPort(0).connect(w2);
    and_gate.getInputPort(1).connect(w2);

    and_gate.getOutputPort(0).connect(w3);
    o.getInputPort(0).connect(w3);

    let objectSet = new DigitalObjectSet([a, b, o, and_gate, w1, w2, w3]);
*/

interface ReturnValue {
    circuit: IOObject[];
    retIndex: number;
    recentPort: OutputPort;
}

/**
 * Checks if the substring of input starting at index is equal to sequence
 */
function subEquals(input: string, index: number, sequence: string): boolean {
    return input.substr(index, sequence.length) === sequence;
}

const opsArray: Array<TokenType> = ["separator", "(", ")", "&", "^", "|", "!"] as  Array<TokenType>;

interface Token {
    type: TokenType;
}

interface InputToken extends Token {
    name: string;
}

interface NewRetValue {
    graph: Graph<Token, boolean>;
    index: number;
}

function getToken(input: string, index: number, ops: Map<TokenType, string>): Token | InputToken {
    for(const op of opsArray) {
        if(subEquals(input, index, ops.get(op)))
            return {type: op};
    }
    let endIndex = index + 1;
    while(endIndex < input.length) {
        for(const op of opsArray) {
            if(subEquals(input, endIndex, ops.get(op)))
                return {type: "label", name: input.substring(index, endIndex)};
        }
        endIndex++;
    }
    return {type: "label", name: input.substring(index, endIndex)};
}

export function GenerateTokens(input: string, ops: Map<TokenType, string>): Token[] {
    const tokenList = new Array<Token>();
    let extraSkip = 0;
    let token: Token;

    let index = 0;

    while(index < input.length) {
        extraSkip = 0;

        token = getToken(input, index, ops);
        if(token.type === "label") {
            tokenList.push(token as InputToken);
            index += (token as InputToken).name.length;
        }
        else if(token.type === "separator") {
            index += ops.get(token.type).length;
        }
        else {
            tokenList.push(token);
            index += ops.get(token.type).length;
        }

        index += extraSkip;
    }

    return tokenList;
}

const precedences = new Map<TokenType, TokenType>([
    ["|", "^"],
    ["^", "&"],
    ["&", "!"],
    ["!", "("],
    ["(", "|"],
]);

const GateConstructors = new Map<string, () => DigitalComponent>([
    ["|", () => new ORGate()],
    ["^", () => new XORGate()],
    ["&", () => new ANDGate()],
    ["!", () => new NOTGate()],
]);

function replaceGate(oldGate: Gate,  circuit: IOObject[]): ReturnValue {
    let newGate: Gate;
    if(oldGate instanceof ANDGate)
        newGate = new NANDGate();
    else if(oldGate instanceof ORGate)
        newGate = new NORGate();
    else if(oldGate instanceof XORGate)
        newGate = new XNORGate();
    else
        return null;

    const wire1 = oldGate.getInputPort(0).getInput();
    const parent1 = wire1.getInput();
    parent1.disconnect(wire1);
    const wire2 = oldGate.getInputPort(1).getInput();
    const parent2 = wire2.getInput();
    parent2.disconnect(wire2);

    const newWire1 = new DigitalWire(parent1, newGate.getInputPort(0));
    newGate.getInputPort(0).connect(newWire1);
    parent1.connect(newWire1);

    const newWire2 = new DigitalWire(parent2, newGate.getInputPort(1));
    newGate.getInputPort(1).connect(newWire2);
    parent2.connect(newWire2);

    circuit.splice(circuit.indexOf(oldGate), 3, newGate, newWire1, newWire2);

    return {circuit: circuit, retIndex: -1, recentPort: newGate.getOutputPort(0)};
}

function parseOp(tokens: Array<Token>, index: number, inputs: Map<string, DigitalComponent>, currentOp: TokenType, precedence: Map<TokenType, TokenType>): ReturnValue {
    const nextOp = precedence.get(currentOp);

    if(nextOp === "(" && tokens[index].type !== currentOp) {
        if(tokens[index].type == "(")
            return parseOp(tokens, index, inputs, nextOp, precedence);
        else
            return {circuit: [], retIndex: index+1, recentPort: inputs.get((tokens[index] as InputToken).name).getOutputPort(0)};
    }

    let leftRet: ReturnValue = null;
    if(currentOp !== "!" && currentOp !== "(") {
        leftRet = parseOp(tokens, index, inputs, nextOp, precedence);
        index = leftRet.retIndex;
        if(index >= tokens.length || tokens[index].type !== currentOp)
            return leftRet;
    }
    index += 1;
    let rightRet: ReturnValue = null;
    if(currentOp === "!" && tokens[index].type === "!")
        rightRet = parseOp(tokens, index, inputs, currentOp, precedence);
    else if(nextOp === "(" && tokens[index].type !== "(")
        rightRet = {circuit: [], retIndex: index+1, recentPort: inputs.get((tokens[index] as InputToken).name).getOutputPort(0)};
    else if(currentOp === "!" || currentOp === "(")
        rightRet = parseOp(tokens, index, inputs, nextOp, precedence);
    else
        rightRet = parseOp(tokens, index, inputs, currentOp, precedence);
    index = rightRet.retIndex;
    if(currentOp === "(") {
        rightRet.retIndex += 1;
        return rightRet;
    }
    const rightCircuit = rightRet.circuit;
    const rightPort = rightRet.recentPort;

    const newGate: DigitalComponent = GateConstructors.get(currentOp).call(null);
    let newComponents: IOObject[] = rightCircuit.concat([newGate]);
    if(currentOp === "!") {
        const parent = rightPort.getParent();
        if(parent instanceof Gate && !(parent as Gate).isNot()) {
            const retInner = replaceGate(parent as Gate, rightCircuit);
            if(retInner !== null)
                return {circuit: retInner.circuit, retIndex: index, recentPort: retInner.recentPort};
        }
    }
    else {
        newComponents = newComponents.concat(leftRet.circuit);
        const leftPort = leftRet.recentPort;
        const w1 = new DigitalWire(leftPort, newGate.getInputPort(1));
        leftPort.connect(w1);
        newGate.getInputPort(1).connect(w1);
        newComponents = newComponents.concat(w1);
    }
    const w2 = new DigitalWire(rightPort, newGate.getInputPort(0));
    rightPort.connect(w2);
    newGate.getInputPort(0).connect(w2);
    newComponents = newComponents.concat(w2);

    return {circuit: newComponents, retIndex: index, recentPort: newGate.getOutputPort(0)};
}

function isOperator(token: Token, leftOperator: boolean = false) {
    if(token === null)
        return false;
    switch(token.type) {
    case "&":
    case "^":
    case "|":
        return true;
    case "!":
        return leftOperator;
    }
    return false;
}

function verifyInputsExist(tokens: Token[], inputs: Map<string, DigitalComponent>) {
    for(const token of tokens) {
        if(token.type !== "label")
            continue;
        const name = (token as InputToken).name;
        if(!inputs.has(name))
            throw new Error("Input Not Found: \"" + name + "\"");
    }
}

function verifyMatchingParenthesis(tokens: Token[]) {
    let open = 0;
    let close = 0;
    for(const token of tokens) {
        if(token.type == "(")
            open++;
        else if(token.type == ")")
            close++;
    }
    if(open > close)
        throw new Error("Encountered Unmatched (");
    else if(open < close)
        throw new Error("Encountered Unmatched )");
}

function verifyExistingOperators(tokens: Token[]) {
    let waitForOperator = false;
    let prevToken: Token;
    for(const token of tokens) {
        if(token.type === "label") {
            if(waitForOperator)
                throw new Error("No valid operator between " + (prevToken as InputToken).name + " and " + (token as InputToken).name);
            waitForOperator = true;
            prevToken = token;
        }
        else if(isOperator(token)) {
            waitForOperator = false;
        }
    }
}

function verifyExistingOperands(tokens: Token[]) {
    let prevToken: Token = null;
    for(const token of tokens) {
        if((prevToken === null || !(prevToken.type === "label" || prevToken.type === ")")) && isOperator(token))
            throw new Error("Missing Left Operand: " + token.type);
        if(isOperator(prevToken, true) && !(token.type === "label" || token.type === "!" || token.type === "("))
            throw new Error("Missing Right Operand: " + prevToken.type);
        prevToken = token;
    }
    if(isOperator(prevToken, true))
        throw new Error("Missing Right Operand: " + prevToken.type);
}

function validateTokens(tokens: Token[], inputs: Map<string, DigitalComponent>) {
    // Calls separate functions to validate tokens because that is way easier
    verifyInputsExist(tokens, inputs);
    verifyMatchingParenthesis(tokens);
    verifyExistingOperators(tokens);
    verifyExistingOperands(tokens);
}

function validateInputOutputTypes(inputs: Map<string, DigitalComponent>, output: DigitalComponent) {
    for(const [name, component] of inputs) {
        if(component.getInputPortCount().getValue() != 0 || component.getOutputPortCount().getValue() == 0)
            throw new Error("Not An Input: " + name);
    }
    if(output.getInputPortCount().getValue() == 0 || output.getOutputPortCount().getValue() != 0)
        throw new Error("Supplied Output Is Not An Output");
}

/**
 * Main driver function for parsing an expression into a circuit
 *
 * @param  inputs A map correlating input name to the DigitalComponent it represents
 * @param  expression The expression to be parsed
 * @param  output The DigitalComponent to use as an output, port 0 will be used
 * @param  ops The strings used to represent the different operators
 * @return The circuit generated by the given expression, null on error (see above)
 * @throws {Error} if any of the input parameters are null or undefined
 * @throws {Error} if an input in inputs is has an input port or does not have an output port
 *                   (thus is not a "real" Input)
 * @throws {Error} if output has an output port or does not have an input port
 *                   (thus is not a "real" Output)
 * @throws {Error} if expression requests an input not found in inputs
 * @throws {Error} if there is an unmatched '(' or ')'
 * @throws {Error} if there is a '!', '&', '^', or '|' that is missing an operand
 */
export function ExpressionToCircuit(inputs: Map<string, DigitalComponent>,
                                    expression: string,
                                    output: DigitalComponent,
                                    ops: Map<TokenType, string> = null): DigitalObjectSet | null {
    if(inputs == null)  throw new Error("Null Parameter: inputs");
    if(expression == null) throw new Error("Null Parameter: expression");
    if(output == null) throw new Error("Null Parameter: output");
    if(ops == null) {
        ops = FormatMap.get("|");
    }
    validateInputOutputTypes(inputs, output);

    const tokenList = GenerateTokens(expression, ops);
    validateTokens(tokenList, inputs);

    // Put this after validating tokens because an input like "(" should produce an error message
    if(inputs.size == 0) return new DigitalObjectSet();

    const parseRet = parseOp(tokenList, 0, inputs, "|", precedences);
    const circuit = parseRet.circuit;
    const outPort = parseRet.recentPort;
    const wire = new DigitalWire(outPort, output.getInputPort(0));
    outPort.connect(wire);
    output.getInputPort(0).connect(wire);
    circuit.push(wire);
    circuit.push(output);

    return new DigitalObjectSet(circuit.concat(Array.from(inputs.values())));
}