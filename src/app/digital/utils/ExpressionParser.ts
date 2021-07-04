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
import {FormatMap, FormatProps} from "./ExpressionParserConstants";
import { Console } from "console";


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

export function GenerateTokens(input: string, ops: Map<FormatProps, string>): Array<string> | null {
    const tokenList = new Array<string>();
    let buffer = "";
    let addToBuffer = false;
    let extraSkip = 0;
    let operandToAdd = "";

    for(let i = 0; i < input.length; i++) {
        addToBuffer = false;
        extraSkip = 0;
        operandToAdd = ""

        if(subEquals(input, i, ops.get("separator"))) {
            addToBuffer = true;
            extraSkip = ops.get("separator").length - 1;
        }
        else if(subEquals(input, i, ops.get("("))) {
            addToBuffer = true;
            extraSkip = ops.get("(").length - 1;
            operandToAdd = ops.get("(");
        }
        else if(subEquals(input, i, ops.get(")"))) {
            addToBuffer = true;
            extraSkip = ops.get(")").length - 1;
            operandToAdd = ops.get(")");
        }
        else if(subEquals(input, i, ops.get("&"))) {
            addToBuffer = true;
            extraSkip = ops.get("&").length - 1;
            operandToAdd = ops.get("&");
        }
        else if(subEquals(input, i, ops.get("^"))) {
            addToBuffer = true;
            extraSkip = ops.get("^").length - 1;
            operandToAdd = ops.get("^");
        }
        else if(subEquals(input, i, ops.get("|"))) {
            addToBuffer = true;
            extraSkip = ops.get("|").length - 1;
            operandToAdd = ops.get("|");
        }
        else if(subEquals(input, i, ops.get("!"))) {
            addToBuffer = true;
            extraSkip = ops.get("!").length - 1;
            operandToAdd = ops.get("!");
        }

        if (addToBuffer) {
            if(buffer.length > 0) {
                tokenList.push(buffer);
                buffer = "";
            }
            if(operandToAdd != "") {
                tokenList.push(operandToAdd);
            }
            i += extraSkip;
        }
        else {
            buffer += input[i];
        }
    }

    if(buffer.length > 0) {
        tokenList.push(buffer);
    }

    return tokenList;
}

const precedences = new Map<FormatProps, FormatProps>([
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
])

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

function parseOp(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>, currentOp: FormatProps, ops: Map<FormatProps, string>, precedence: Map<FormatProps, FormatProps>): ReturnValue {
    const nextOp = precedence.get(currentOp);

    if(nextOp === "(" && tokens[index] !== ops.get(currentOp)) {
        if(tokens[index] == ops.get("("))
            return parseOp(tokens, index, inputs, nextOp, ops, precedence);
        else
            return parseOther(tokens, index, inputs, ops);
    }

    let leftRet: ReturnValue = null;
    if(currentOp !== "!" && currentOp !== "(") {
        leftRet = parseOp(tokens, index, inputs, nextOp, ops, precedence);
        index = leftRet.retIndex;
        if(index >= tokens.length || tokens[index] !== ops.get(currentOp))
            return leftRet;
    }
    index += 1;
    if(index >= tokens.length) {
        if(currentOp === "(")
            throw new Error("Encountered Unmatched " + ops.get("("));
        throw new Error("Missing Right Operand: " + ops.get(currentOp));
    }
    let rightRet: ReturnValue = null;
    if(currentOp === "!" && tokens[index] === ops.get("!"))
        rightRet = parseOp(tokens, index, inputs, currentOp, ops, precedence);
    else if(nextOp === "(" && tokens[index] !== ops.get("("))
        rightRet = parseOther(tokens, index, inputs, ops);
    else if(currentOp === "!" || currentOp === "(")
        rightRet = parseOp(tokens, index, inputs, nextOp, ops, precedence);
    else
        rightRet = parseOp(tokens, index, inputs, currentOp, ops, precedence);
    index = rightRet.retIndex;
    if(currentOp === "(") {
        if(rightRet.retIndex >= tokens.length)
            throw new Error("Encountered Unmatched " + ops.get("("));
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

function parseOther(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>, ops: Map<FormatProps, string>): ReturnValue {
    const inputName = tokens[index];
    if(!inputs.has(inputName)) {
        switch (inputName) {
        case ops.get("&"):
        case ops.get("|"):
        case ops.get("^"):
            throw new Error("Missing Left Operand: " + inputName);
        case ops.get(")"):
            throw new Error("Encountered Unmatched " + ops.get(")"));
        default:
            throw new Error("Input Not Found: " + inputName);
        }
    }
    index += 1;
    return {circuit: [], retIndex: index, recentPort: inputs.get(inputName).getOutputPort(0)};
}

function getComponentsValidate(inputs: Map<string, DigitalComponent>): IOObject[] {
    const components: IOObject[] = [];
    for(const [name, component] of inputs) {
        if(component.getInputPortCount().getValue() != 0
          || component.getOutputPortCount().getValue() == 0) {
            throw new Error("Not An Input: " + name);
        }
        components.push(component);
    }

    return components;
}

function isInput(token: string, ops: Map<FormatProps, string>) {
    switch(token) {
    case ops.get("("):
    case ops.get(")"):
    case ops.get("&"):
    case ops.get("^"):
    case ops.get("|"):
    case ops.get("!"):
        return false;
    }
    return true;
}

function isOperator(token: string, ops: Map<FormatProps, string>) {
    switch(token) {
    case ops.get("&"):
    case ops.get("^"):
    case ops.get("|"):
        return true;
    }
    return false;
}

function validateToken(inputs: Map<string, DigitalComponent>, token: string, ops: Map<FormatProps, string>) {
    if (isInput(token, ops) && !inputs.has(token))
        throw new Error("Input Not Found: " + token);
}

function getTokenListValidate(inputs: Map<string, DigitalComponent>, expression: string,
                       output: DigitalComponent, ops: Map<FormatProps, string>): string[] {
    if(output.getInputPortCount().getValue() == 0
      || output.getOutputPortCount().getValue() != 0) {
        throw new Error("Supplied Output Is Not An Output");
    }

    const tokenList = GenerateTokens(expression, ops);
    let token: string;
    let waitForOperator: boolean = false;
    let prevToken: string;
    for(let i = 0; i < tokenList.length; i++) {
        const token = tokenList[i];
        validateToken(inputs, token, ops);
        if (isInput(token, ops)) {
            if (waitForOperator)
                throw new Error("No valid operator between " + prevToken + " and " + token);
            waitForOperator = true;
            prevToken = token;
        }
        else if(isOperator(token, ops)) {
            waitForOperator = false;
        }
    }

    return tokenList;
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
                                    ops: Map<FormatProps, string> = null): DigitalObjectSet | null {
    if(inputs == null)  throw new Error("Null Parameter: inputs");
    if(expression == null) throw new Error("Null Parameter: expression");
    if(output == null) throw new Error("Null Parameter: output");
    if(ops == null) {
        ops = FormatMap.get("|");
    }
    // console.log(ops);
    
    const components: IOObject[] = getComponentsValidate(inputs);
    const tokenList = getTokenListValidate(inputs, expression, output, ops);

    if(inputs.size == 0) return new DigitalObjectSet();

    const parseRet = parseOp(tokenList, 0, inputs, "|", ops, precedences);
    const index = parseRet.retIndex;
    if(index < tokenList.length && tokenList[index] == ops.get(")"))
        throw new Error("Encountered Unmatched " + ops.get(")"));
    const circuit = parseRet.circuit;
    const outPort = parseRet.recentPort;
    const wire = new DigitalWire(outPort, output.getInputPort(0));
    outPort.connect(wire);
    output.getInputPort(0).connect(wire);
    components.push(wire);
    components.push(output);
    if(index < tokenList.length)
        console.log("DONE: " + index + " " + tokenList.length);
    return new DigitalObjectSet(circuit.concat(components));
}