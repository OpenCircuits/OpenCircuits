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

export function GenerateTokens(input: string): Array<string> | null {
    const tokenList = new Array<string>();
    let buffer = "";
    let c: string;

    for(let i = 0; i < input.length; i++) {
        c = input[i];
        switch(c) {
        case " ":
            if(buffer.length > 0) {
                tokenList.push(buffer);
                buffer = "";
            }
            break;
        case "(":
        case ")":
        case "&":
        case "^":
        case "|":
        case "!":
            if(buffer.length > 0) {
                tokenList.push(buffer);
                buffer = "";
            }
            tokenList.push(c);
            break;
        default:
            buffer += c;
            break;
        }
    }

    if(buffer.length > 0) {
        tokenList.push(buffer);
    }

    return tokenList;
}

function parseOr(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    const leftRet = parseXor(tokens, index, inputs);
    index = leftRet.retIndex;
    if(index >= tokens.length || tokens[index] != "|")
        return leftRet;
    index += 1;
    if(index >= tokens.length)
        throw new Error("Missing Right Operand: |");

    const leftCircuit = leftRet.circuit;
    const leftPort = leftRet.recentPort;
    const rightRet = parseOr(tokens, index, inputs);
    const rightCircuit = rightRet.circuit;
    index = rightRet.retIndex;
    const rightPort = rightRet.recentPort;

    const newGate = new ORGate();
    const w1 = new DigitalWire(leftPort, newGate.getInputPort(0));
    const w2 = new DigitalWire(rightPort, newGate.getInputPort(1));
    leftPort.connect(w1);
    newGate.getInputPort(0).connect(w1);
    rightPort.connect(w2);
    newGate.getInputPort(1).connect(w2);
    const newComponents: IOObject[] = [newGate, w1, w2];

    return {circuit: newComponents.concat(leftCircuit).concat(rightCircuit), retIndex: index, recentPort: newGate.getOutputPort(0)};
}

function parseXor(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    const leftRet = parseAnd(tokens, index, inputs);
    index = leftRet.retIndex;
    if(index >= tokens.length || tokens[index] != "^")
        return leftRet;
    index += 1;
    if(index >= tokens.length)
        throw new Error("Missing Right Operand: ^");

    const leftCircuit = leftRet.circuit;
    const leftPort = leftRet.recentPort;
    const rightRet = parseXor(tokens, index, inputs);
    const rightCircuit = rightRet.circuit;
    index = rightRet.retIndex;
    const rightPort = rightRet.recentPort;

    const newGate = new XORGate();
    const w1 = new DigitalWire(leftPort, newGate.getInputPort(0));
    const w2 = new DigitalWire(rightPort, newGate.getInputPort(1));
    leftPort.connect(w1);
    newGate.getInputPort(0).connect(w1);
    rightPort.connect(w2);
    newGate.getInputPort(1).connect(w2);
    const newComponents: IOObject[] = [newGate, w1, w2];

    return {circuit: newComponents.concat(leftCircuit).concat(rightCircuit), retIndex: index, recentPort: newGate.getOutputPort(0)};
}

function parseAnd(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    const leftRet = parseNot(tokens, index, inputs);
    index = leftRet.retIndex;
    if(index >= tokens.length || tokens[index] != "&")
        return leftRet;
    index += 1;
    if(index >= tokens.length)
        throw new Error("Missing Right Operand: &");

    const leftCircuit = leftRet.circuit;
    const leftPort = leftRet.recentPort;
    const rightRet = parseAnd(tokens, index, inputs);
    const rightCircuit = rightRet.circuit;
    index = rightRet.retIndex;
    const rightPort = rightRet.recentPort;

    const newGate = new ANDGate();
    const w1 = new DigitalWire(leftPort, newGate.getInputPort(0));
    const w2 = new DigitalWire(rightPort, newGate.getInputPort(1));
    leftPort.connect(w1);
    newGate.getInputPort(0).connect(w1);
    rightPort.connect(w2);
    newGate.getInputPort(1).connect(w2);
    const newComponents: IOObject[] = [newGate, w1, w2];

    return {circuit: newComponents.concat(leftCircuit).concat(rightCircuit), retIndex: index, recentPort: newGate.getOutputPort(0)};
}

function replaceGate(oldGate: Gate,  circuit: IOObject[]): ReturnValue {
    let newGate: Gate;
    if(parent instanceof ANDGate)
        newGate = new NANDGate();
    else if(parent instanceof ORGate)
        newGate = new NORGate();
    else if(parent instanceof XORGate)
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

function parseNot(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    if(tokens[index] != "!") {
        if(tokens[index] == "(")
            return parseParen(tokens, index, inputs);
        else
            return parseOther(tokens, index, inputs);
    }
    index += 1;
    if(index >= tokens.length)
        throw new Error("Missing Operand: !");

    let ret: ReturnValue;
    if(tokens[index] == "!")
        ret = parseNot(tokens, index, inputs);
    else if(tokens[index] == "(")
        ret = parseParen(tokens, index, inputs);
    else
        ret = parseOther(tokens, index, inputs);
    const circuit = ret.circuit;
    index = ret.retIndex;
    const port = ret.recentPort;
    const parent = port.getParent();
    if(parent instanceof Gate && !(parent as Gate).isNot()) {
        const retInner = replaceGate(parent as Gate, circuit);
        if(retInner != null)
            return {circuit: retInner.circuit, retIndex: index, recentPort: retInner.recentPort};
    }
    const gate = new NOTGate();
    const wire = new DigitalWire(port, gate.getInputPort(0));
    gate.getInputPort(0).connect(wire);
    port.connect(wire);
    const newComponents: IOObject[] = [gate, wire];

    return {circuit: circuit.concat(newComponents), retIndex: index, recentPort: gate.getOutputPort(0)};
}

function parseParen(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    index += 1;
    if(index >= tokens.length)
        throw new Error("Encountered Unmatched (");
    const ret = parseOr(tokens, index, inputs);
    index = ret.retIndex;
    if(index >= tokens.length)
        throw new Error("Encountered Unmatched (");
    ret.retIndex += 1;
    return ret;
}

function parseOther(tokens: Array<string>, index: number, inputs: Map<string, DigitalComponent>): ReturnValue {
    const inputName = tokens[index];
    if(!inputs.has(inputName)) {
        switch (inputName) {
        case "&":
        case "|":
        case "^":
            throw new Error("Missing Left Operand: " + inputName);
        case ")":
            throw new Error("Encountered Unmatched )");
        }
    }
    const inputComponent = inputs.get(inputName);
    const newOutput = inputComponent.getOutputPort(0);
    const newCircuit: IOObject[] = [];
    index += 1;
    return {circuit: newCircuit, retIndex: index, recentPort: newOutput};
}

/**
 * Main driver function for parsing an expression into a circuit
 *
 * @param  inputs A map correlating input name to the DigitalComponent it represents
 * @param  expression The expression to be parsed
 * @param  output The DigitalComponent to use as an output, port 0 will be used
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
                                    output: DigitalComponent): DigitalObjectSet | null {
    if(inputs == null)  throw new Error("Null Parameter: inputs");
    if(expression == null) throw new Error("Null Parameter: expression");
    if(output == null) throw new Error("Null Parameter: output");

    const components: IOObject[] = [];
    for(const [name, component] of inputs) {
        if(component.getInputPortCount().getValue() != 0
          || component.getOutputPortCount().getValue() == 0) {
            throw new Error("Not An Input: " + name);
        }
        components.push(component);
    }

    if(output.getInputPortCount().getValue() == 0
      || output.getOutputPortCount().getValue() != 0) {
        throw new Error("Supplied Output Is Not An Output");
    }

    const tokenList = GenerateTokens(expression);
    let token: string;
    for(let i = 0; i < tokenList.length; i++) {
        token = tokenList[i];
        switch(token) {
        case "(":
        case ")":
        case "&":
        case "^":
        case "|":
        case "!":
            break;
        default:
            if(!inputs.has(token))
                throw new Error("Input Not Found: " + token);
            break;
        }
    }

    if(inputs.size == 0) {
        return new DigitalObjectSet();
    }

    const parseRet = parseOr(tokenList, 0, inputs);
    const index = parseRet.retIndex;
    if(index < tokenList.length && tokenList[index] == ")") {
        throw new Error("Encountered Unmatched )");
    }
    const circuit = parseRet.circuit;
    const outPort = parseRet.recentPort;
    const wire = new DigitalWire(outPort, output.getInputPort(0));
    outPort.connect(wire);
    output.getInputPort(0).connect(wire);
    components.push(wire);
    components.push(output);

    return new DigitalObjectSet(circuit.concat(components));
}