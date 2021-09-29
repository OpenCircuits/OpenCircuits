import {IOObject} from "core/models/IOObject";
import {DigitalComponent} from "digital/models/index";
import {DigitalObjectSet} from "digital/utils/ComponentUtils";
import {Gate} from "digital/models/ioobjects/gates/Gate";
import {ANDGate, NANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate, NORGate} from "digital/models/ioobjects/gates/ORGate";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {XORGate, XNORGate} from "digital/models/ioobjects/gates/XORGate";
import {DigitalWire} from "digital/models/DigitalWire";
import {FormatMap, TokenType, Token,
        OpsArray, GateConstructors,
        InputToken, DefaultPrecedences,
        InputTree, NewTreeRetValue} from "./ExpressionParserConstants";


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

/**
 * Checks if the substring of input starting at index is equal to sequence
 */
function subEquals(input: string, index: number, sequence: string): boolean {
    return input.substr(index, sequence.length) === sequence;
}

function isOperator(token: Token, leftOperator: boolean = false) {
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

function validateInputOutputTypes(inputs: Map<string, DigitalComponent>, output: DigitalComponent) {
    for(const [name, component] of inputs) {
        if(component.getInputPortCount().getValue() != 0 || component.getOutputPortCount().getValue() == 0)
            throw new Error("Not An Input: " + name);
    }
    if(output.getInputPortCount().getValue() == 0 || output.getOutputPortCount().getValue() != 0)
        throw new Error("Supplied Output Is Not An Output");
}

function getInput(input: string, index: number, ops: Map<TokenType, string>): InputToken {
    let endIndex = index + 1;
    while(endIndex < input.length) {
        for(const op of OpsArray) {
            if(subEquals(input, endIndex, ops.get(op)))
                return {type: "label", name: input.substring(index, endIndex)};
        }
        endIndex++;
    }
    return {type: "label", name: input.substring(index, endIndex)};
}

function getToken(input: string, index: number, ops: Map<TokenType, string>): Token | InputToken {
    for(const op of OpsArray) {
        if(subEquals(input, index, ops.get(op)))
            return {type: op};
    }
    return getInput(input, index, ops);
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
        open += +(token.type === "(");
        close += +(token.type === ")");
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
        if((prevToken === null || !(prevToken.type === "label" || prevToken.type === ")")) && token !== null && isOperator(token))
            throw new Error("Missing Left Operand: " + token.type);
        if(prevToken !== null && isOperator(prevToken, true) && !(token.type === "label" || token.type === "!" || token.type === "("))
            throw new Error("Missing Right Operand: " + prevToken.type);
        prevToken = token;
    }
    if(prevToken !== null && isOperator(prevToken, true))
        throw new Error("Missing Right Operand: " + prevToken.type);
}

function validateTokens(tokens: Token[], inputs: Map<string, DigitalComponent>) {
    // Calls separate functions to validate tokens because that is way easier
    verifyInputsExist(tokens, inputs);
    verifyMatchingParenthesis(tokens);
    verifyExistingOperators(tokens);
    verifyExistingOperands(tokens);
}

export function generateInputTree(tokens: Array<Token>, index: number = 0, currentOp: TokenType = "|"): NewTreeRetValue {
    const nextOp = DefaultPrecedences.get(currentOp);

    // When this function has recursed through to "!" and the token still isn't that, then
    //  the only possibilites left are an input or open parenthesis token
    if(currentOp === "!" && tokens[index].type !== "!") {
        if(tokens[index].type === "(")
            return generateInputTree(tokens, index, nextOp);
        else
            return {index: index+1, tree: {kind: "leaf", ident: (tokens[index] as InputToken).name}};
    }

    // This section gets the part of the tree from the left side of the operator.
    //  "!" and "(" only have operands on their right side, so this section is skipped for them
    let leftRet: NewTreeRetValue;
    if(currentOp !== "!" && currentOp !== "(") {
        leftRet = generateInputTree(tokens, index, nextOp);
        index = leftRet.index;
        // If this isn't the right operation to apply, return
        if(index >= tokens.length || tokens[index].type !== currentOp)
            return leftRet;
    }

    // This section gets the part of the tree from the right side of the operand. index is incremented by 1
    //  so it now points to the token on the right side of the operator.
    index += 1;
    let rightRet: NewTreeRetValue = null;
    if(currentOp === "!" && tokens[index].type === "!") // This case applies when there are two !'s in a row
        rightRet = generateInputTree(tokens, index, currentOp);
    else if(currentOp === "!" && tokens[index].type === "label") // This case would apply when an input follows a "!"
        rightRet = {index: index+1, tree: {kind: "leaf", ident: (tokens[index] as InputToken).name}};
    else if(currentOp === "(")
        rightRet = generateInputTree(tokens, index, nextOp);
    else
        rightRet = generateInputTree(tokens, index, currentOp);
    index = rightRet.index;
    if(currentOp === "(") {
        rightRet.index += 1; // Incremented to skip the ")"
        return rightRet;
    }

    // The tree tree is created with the new node as the root and returned
    let tree: InputTree;
    if(currentOp === "!")
        tree = {kind: "unop", type: "!", child: rightRet.tree};
    else if(currentOp === "|" || currentOp === "^" || currentOp === "&")
        tree = {kind: "binop", type: currentOp, lChild: leftRet.tree, rChild: rightRet.tree};
    return {index: index, tree: tree};

}

export function connectGate(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    const outPort = source.getOutputPort(0);
    let inPort = destination.getInputPort(0);
    if(inPort.getWires().length > 0)
        inPort = destination.getInputPort(1);
    const wire = new DigitalWire(outPort, inPort);
    inPort.connect(wire);
    outPort.connect(wire);
    return wire;
}

function treeToCircuitCore(node: InputTree, inputs: Map<string, DigitalComponent>, circuit: IOObject[]): IOObject[] {
    if(node.kind === "leaf")
        return null;

    const ret = circuit;
    const newGate = GateConstructors.get(node.type).call(null);
    if(node.kind === "unop") {
        let prevNode: DigitalComponent;
        if(node.child.kind === "leaf")
            prevNode = inputs.get(node.child.ident);
        else
            prevNode = treeToCircuitCore(node.child, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wire = connectGate(prevNode, newGate);
        ret.push(wire);
    }
    else if(node.kind === "binop") {
        let prevNodeL: DigitalComponent;
        if(node.lChild.kind === "leaf")
            prevNodeL = inputs.get(node.lChild.ident);
        else
            prevNodeL = treeToCircuitCore(node.lChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireL = connectGate(prevNodeL, newGate);
        ret.push(wireL);
        let prevNodeR: DigitalComponent;
        if(node.rChild.kind === "leaf")
            prevNodeR = inputs.get(node.rChild.ident);
        else
            prevNodeR = treeToCircuitCore(node.rChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireR = connectGate(prevNodeR, newGate);
        ret.push(wireR);
    }
    ret.push(newGate);
    return ret;
}

export function treeToCircuit(tree: InputTree, inputs: Map<string, DigitalComponent>, output: DigitalComponent): IOObject[] {
    let ret: IOObject[] = Array.from(inputs.values());
    ret.push(output);

    if(tree.kind === "leaf") {
        const wire = connectGate(inputs.get(tree.ident), output);
        ret.push(wire);
        return ret;
    }
    ret = treeToCircuitCore(tree, inputs, ret);
    const wire = connectGate(ret.slice(-1)[0] as DigitalComponent, output);
    ret.push(wire);
    return ret;

}

function getNottedGate(oldGate: Gate): Gate | null {
    if(oldGate instanceof ANDGate)
        return new NANDGate();
    else if(oldGate instanceof ORGate)
        return new NORGate();
    else if(oldGate instanceof XORGate)
        return new XNORGate();
    else
        return null;
}

function replaceGate(oldGate: Gate,  circuit: IOObject[]): IOObject[] {
    const newGate = getNottedGate(oldGate);

    const wire1 = oldGate.getInputPort(0).getInput();
    const parent1 = wire1.getInput();
    parent1.disconnect(wire1);
    const wire2 = oldGate.getInputPort(1).getInput();
    const parent2 = wire2.getInput();
    parent2.disconnect(wire2);
    const outWire = oldGate.getOutputPort(0).getConnections()[0];
    const oldNotGate = outWire.getOutputComponent();
    const outWires = oldNotGate.getOutputPort(0).getConnections();
    const children = outWires.map(wire => wire.getOutput());
    children.forEach(child => child.disconnect());

    const newWire1 = new DigitalWire(parent1, newGate.getInputPort(0));
    newGate.getInputPort(0).connect(newWire1);
    parent1.connect(newWire1);

    const newWire2 = new DigitalWire(parent2, newGate.getInputPort(1));
    newGate.getInputPort(1).connect(newWire2);
    parent2.connect(newWire2);

    const newWires: DigitalWire[] = [];
    for(const child of children) {
        const newWireTemp = new DigitalWire(newGate.getOutputPort(0), child);
        newWires.push(newWireTemp);
        newGate.getOutputPort(0).connect(newWireTemp);
        child.connect(newWireTemp);
    }

    // Using separate splices because I don't want to rely on everything being ordered in a certain way
    for(let i = 0; i < outWires.length; i++)
        circuit.splice(circuit.indexOf(outWires[i]), 1, newWires[i]);
    circuit.splice(circuit.indexOf(wire1), 1, newWire1);
    circuit.splice(circuit.indexOf(wire2), 1, newWire2);
    circuit.splice(circuit.indexOf(oldGate), 1, newGate);
    circuit.splice(circuit.indexOf(outWire), 1);
    circuit.splice(circuit.indexOf(oldNotGate), 1);

    return circuit;
}

export function createNegationGates(circuit: IOObject[]): IOObject[] {
    let newCircuit = [...circuit];
    for(const object of circuit) {
        if(!(object instanceof Gate))
            continue;
        if(!object.isNot() && object.getOutputPort(0).getWires()[0].getOutputComponent() instanceof NOTGate)
            newCircuit = replaceGate(object, newCircuit);
    }
    return newCircuit;
}

/**
 * Main driver function for parsing an expression into a circuit
 *
 * @param  inputs A map correlating input name to the DigitalComponent it represents
 * @param  expression The expression to be parsed
 * @param  output The DigitalComponent to use as an output, port 0 will be used
 * @param  ops The strings used to represent the different operators
 * @return The circuit generated by the given expression, null on error (see above)
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
                                    ops: Map<TokenType, string> = FormatMap.get("|")): DigitalObjectSet | null {

    validateInputOutputTypes(inputs, output);

    const tokenList = GenerateTokens(expression, ops);
    validateTokens(tokenList, inputs);

    // Put this after validating tokens because an input like "(" should produce an error message
    if(inputs.size == 0) return new DigitalObjectSet();

    const connectedTree = generateInputTree(tokenList).tree;

    const fullCircuit = treeToCircuit(connectedTree, inputs, output);

    const condensedCircuit = createNegationGates(fullCircuit);

    return new DigitalObjectSet(condensedCircuit);
}