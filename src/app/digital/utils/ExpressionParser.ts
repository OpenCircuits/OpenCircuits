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
        InputTree, NewTreeRetValue, FormatLabels} from "./ExpressionParserConstants";

/**
 * Checks if the substring of a given input starting at a given index is equal to a given sequence
 * 
 * @param input the input string that a substring of will be examined
 * @param index the starting index of input to compare at
 * @param sequence the sequence to check equality with
 * @return true if input has a substring starting at index that matches sequence, false otherwise
 */
function subEquals(input: string, index: number, sequence: string): boolean {
    return input.substr(index, sequence.length) === sequence;
}

/**
 * Used to check if the given token represents an operator (&, ^, |, or !)
 * 
 * @param token the token to check
 * @returns true if token's type is &, ^, |, or !, false otherwise
 */
function isOperator(token: Token) {
    switch(token.type) {
    case "&":
    case "^":
    case "|":
    case "!":
        return true;
    }
    return false;
}

/**
 * Validates that the given inputs are inputs (thus have 0 input ports and at least 1 output ports)
 *  and the output is an outputs (thus have at least one input port and 0 output ports)
 * 
 * @param inputs a map containing the input components to verify
 * @param output the output component to verify
 * @throws {Error} if one of the inputs has an input port or has no output ports
 * @throws {Error} if the output has no input ports or an output port
 */
function validateInputOutputTypes(inputs: Map<string, DigitalComponent>, output: DigitalComponent) {
    for(const [name, component] of inputs) {
        if(component.getInputPortCount().getValue() !== 0 || component.getOutputPortCount().getValue() === 0)
            throw new Error("Not An Input: \"" + name + "\"");
    }
    if(output.getInputPortCount().getValue() === 0 || output.getOutputPortCount().getValue() !== 0)
        throw new Error("Supplied Output Is Not An Output");
}

/**
 * Extracts the input name from an expression starting at a certain location
 * 
 * @param expression the expression to extract the input name from
 * @param index the index at which the input starts
 * @param ops the representation format for the operations used in this expression
 * @returns an InputToken with the input name in it
 */
function getInput(expression: string, index: number, ops: Map<FormatLabels, string>): InputToken {
    let endIndex = index + 1;
    while(endIndex < expression.length) {
        for(const op of OpsArray) {
            if(subEquals(expression, endIndex, ops.get(op)))
                return {type: "input", name: expression.substring(index, endIndex)};
        }
        if(subEquals(expression, endIndex, ops.get("separator")))
            return {type: "input", name: expression.substring(index, endIndex)};
        endIndex++;
    }
    return {type: "input", name: expression.substring(index, endIndex)};
}

/**
 * Gets a token from a given expression starting at a certain index
 * 
 * @param expression the expression to extract the token from
 * @param index the index where the token starts
 * @param ops the representation format for the operations used in this expression
 * @returns the token extracted from the expression or null if the index points to the starting location of
 *              a separator (like " ")
 */
function getToken(expression: string, index: number, ops: Map<FormatLabels, string>): Token | null {
    for(const op of OpsArray) {
        if(subEquals(expression, index, ops.get(op)))
            return {type: op};
    }
    if(subEquals(expression, index, ops.get("separator")))
        return null;
    return getInput(expression, index, ops);
}

/**
 * Converts the given expression to an array of tokens
 * 
 * @param expression the expression to convert
 * @param ops the representation format for the operations used in this expression
 * @returns a list of tokens that represent the given expression
 * @throws {Error} if ops is missing the keys "|", "^", "&", "(", ")", or "separator"
 * @throws {Error} if the value in ops for keys "|", "^", "&", "(", ")", or "separator" is ""
 */
export function GenerateTokens(expression: string, ops: Map<FormatLabels, string>): Token[] {
    for(const op of OpsArray) {
        if(!ops.has(op))
            throw new Error("No " + op + " in supplied operation symbols");
        if(ops.get(op) === "")
            throw new Error("Length zero " + op + " in supplied operation symbols");
    }
    if(!ops.has("separator"))
        throw new Error("No separator in supplied operation symbols");
    if(ops.get("separator") === "")
        throw new Error("Length zero separator in supplied operation symbols");

    const tokenList = new Array<Token>();
    let extraSkip = 0;
    let token: Token;

    let index = 0;

    while(index < expression.length) {
        extraSkip = 0;

        token = getToken(expression, index, ops);
        if(token === null)
            index += ops.get("separator").length;
        else if(token.type === "input") {
            tokenList.push(token);
            index += token.name.length;
        }
        else {
            tokenList.push(token);
            index += ops.get(token.type).length;
        }

        index += extraSkip;
    }

    return tokenList;
}

/**
 * The core of the function to generate the input tree. Various errors are returned for invalid inputs.
 *  It is recommended to not call this function directly and instead call GenerateInputTree
 * 
 * @param tokens the array of tokens representing the expression to parse
 * @param currentOp the current operation to evaluate, should default to operation with lowest precedence to start
 * @param index the index of the parsing process in the tokens Array
 * @returns the current input tree and the current parsing index
 * @throws {Error} parenthesis do not include anything (such as "()")
 * @throws {Error} an opening parenthesis is missing a corresponding closing parenthesis (such as "(a")
 * @throws {Error} a closing parenthesis is missing a corresponding opening parenthesis (such as ")a")
 * @throws {Error} |, &, or ^ are missing an operand on their left (such as "a|")
 * @throws {Error} |, &, ^, or ! are missing an operand on their right (such as "!a")
 * @see GenerateInputTree
 */
function generateInputTreeCore(tokens: Array<Token>, ops: Map<FormatLabels, string>, currentOp: TokenType = "|", index: number = 0): NewTreeRetValue {
    const nextOp = DefaultPrecedences.get(currentOp);
    if(tokens[index].type === ")") {
        if(index > 0) {
            if(tokens[index-1].type === "(")
                throw new Error("Empty Parenthesis");
            else if(isOperator(tokens[index-1]))
                throw new Error("Missing Right Operand: \"" + ops.get(tokens[index-1].type as FormatLabels) + "\"");
        }
        throw new Error("Encountered Unmatched \"" + ops.get(")") + "\"");
    }

    // When this function has recursed through to "!" and the token still isn't that, then
    //  the only possibilites left are an input or open parenthesis token
    if(currentOp === "!" && tokens[index].type !== "!") {
        const token = tokens[index];
        if(token.type === "(")
            return generateInputTreeCore(tokens, ops, nextOp, index);
        else if(token.type === "input")
            return {index: index+1, tree: {kind: "leaf", ident: token.name}};
        else
            throw new Error("Missing Left Operand: \"" + ops.get(token.type) + "\"");
    }

    // This section gets the part of the tree from the left side of the operator.
    //  "!" and "(" only have operands on their right side, so this section is skipped for them
    let leftRet: NewTreeRetValue;
    if(currentOp !== "!" && currentOp !== "(") {
        leftRet = generateInputTreeCore(tokens, ops, nextOp, index);
        index = leftRet.index;
        // If this isn't the right operation to apply, return
        if(index >= tokens.length || tokens[index].type !== currentOp)
            return leftRet;
    }

    // This section gets the part of the tree from the right side of the operand. index is incremented by 1
    //  so it now points to the token on the right side of the operator.
    index += 1;
    if(index >= tokens.length && currentOp !== "(") {
        throw new Error("Missing Right Operand: \"" + ops.get(currentOp) + "\"");
    }
    let rightRet: NewTreeRetValue = null;
    const rightToken = tokens[index];
    if(currentOp === "!" && rightToken.type === "!") // This case applies when there are two !'s in a row
        rightRet = generateInputTreeCore(tokens, ops, currentOp, index);
    else if(currentOp === "!" && rightToken.type === "input") // This case would apply when an input follows a "!"
        rightRet = {index: index+1, tree: {kind: "leaf", ident: rightToken.name}};
    else if(currentOp === "(") {
        if(index >= tokens.length)
            throw new Error("Encountered Unmatched \"" + ops.get("(") + "\"");
        rightRet = generateInputTreeCore(tokens, ops, nextOp, index);
    }
    else
        rightRet = generateInputTreeCore(tokens, ops, currentOp, index);
    index = rightRet.index;
    if(currentOp === "(") {
        if(index >= tokens.length)
            throw new Error("Encountered Unmatched \"" + ops.get("(") + "\"");
        if(tokens[index].type !== ")")
            throw new Error("Encountered Unmatched \"" + ops.get("(") + "\"");
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

/**
 * The core of the function to generate the input tree. Various errors are returned for invalid inputs
 * 
 * @param tokens the array of tokens representing the expression to parse
 * @param ops the representation format for the operations used in this expression (only used for error messages)
 * @returns null if tokens.length is 0, the relevant input tree otherwise
 * @throws {Error} parenthesis do not include anything (such as "()")
 * @throws {Error} an opening parenthesis is missing a corresponding closing parenthesis (such as "(")
 * @throws {Error} a closing parenthesis is missing a corresponding opening parenthesis (such as ")")
 * @throws {Error} |, &, or ^ are missing an operand on their left (such as "a|")
 * @throws {Error} |, &, ^, or ! are missing an operand on their right (such as "!a")
 * @throws {Error} there is no operator between two inputs (such as "a b")
 * @throws {Error} generateInputTreeCore returns back up to this function before the end of tokens is reached
 *                  for any other reason
 */
export function GenerateInputTree(tokens: Array<Token>, ops: Map<FormatLabels, string> = FormatMap.get("|")): InputTree | null {
    if(tokens.length === 0)
        return null;
    const ret = generateInputTreeCore(tokens, ops);

    const index = ret.index;
    if(index < tokens.length) {
        if(tokens[index].type === ")")
            throw new Error("Encountered Unmatched \"" + ops.get(")") + "\"");

        let prev: string = null;
        for(let prevIndex = index-1; prevIndex >= 0; prevIndex--) {
            const prevToken = tokens[prevIndex];
            if(prevToken.type === "input") {
                prev = prevToken.name;
                break;
            }
        }
        let next: string = null;
        for(let nextIndex = index; nextIndex < tokens.length; nextIndex++) {
            const nextToken = tokens[nextIndex];
            if(nextToken.type === "input") {
                next = nextToken.name;
                break;
            }
        }
        if(prev !== null && next !== null)
            throw new Error("No valid operator between \"" + prev + "\" and \"" + next + "\"");
        
        console.log(ret.tree);
        throw new Error("Parsing ended prematurely");
    }

    return ret.tree;
}

/**
 * Connects two components together. Source must have an output and destination must have an available input.
 * 
 * @param source the source component to connect
 * @param destination the destination component to connect
 * @returns the wire used to connect the components together
 */
export function ConnectGate(source: DigitalComponent, destination: DigitalComponent): DigitalWire {
    const outPort = source.getOutputPort(0);
    let inPort = destination.getInputPort(0);
    if(inPort.getWires().length > 0)
        inPort = destination.getInputPort(1);
    const wire = new DigitalWire(outPort, inPort);
    inPort.connect(wire);
    outPort.connect(wire);
    return wire;
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 *  Note that the circuit parameter is edited in place by this function.
 *  Avoid calling this function directly, use TreeToCircuit instead. 
 * 
 * @param node the root node of the InputTree to convert
 * @param inputs the input components used by this expression
 * @param circuit used to store the circuit while recursing, on the intial call it should contain the DigitalComponents found in inputs
 * @returns the current part of the tree that has been converted to a circuit, the most recently used component
 *              should always be last in the array
 * @throws {Error} when one of the leaf nodes of the InputTree references an input that is not inputs
 * @see TreeToCircuit
 */
function treeToCircuitCore(node: InputTree, inputs: Map<string, DigitalComponent>, circuit: IOObject[]): IOObject[] {
    if(node.kind === "leaf") { //Rearranges array so thge relevant input is at the end
        if(!inputs.has(node.ident))
            throw new Error("Input Not Found: \"" + node.ident + "\"");
        const index = circuit.indexOf(inputs.get(node.ident));
        circuit.splice(index, 1);
        circuit.push(inputs.get(node.ident));
        return circuit;
    }

    const ret = circuit;
    const newGate = GateConstructors.get(node.type).call(null);
    if(node.kind === "unop") {
        const prevNode = treeToCircuitCore(node.child, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wire = ConnectGate(prevNode, newGate);
        ret.push(wire);
    }
    else if(node.kind === "binop") {
        const prevNodeL = treeToCircuitCore(node.lChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireL = ConnectGate(prevNodeL, newGate);
        ret.push(wireL);
        const prevNodeR = treeToCircuitCore(node.rChild, inputs, ret).slice(-1)[0] as DigitalComponent;
        const wireR = ConnectGate(prevNodeR, newGate);
        ret.push(wireR);
    }
    ret.push(newGate);
    return ret;
}

/**
 * Converts a given InputTree to an array of connected components (and the wires used to connect them).
 * 
 * @param node the root node of the InputTree to convert
 * @param inputs the input components used by this expression
 * @param output the component that the circuit outputs to
 * @returns the components and wires converted from the tree
 * @throws {Error} when one of the leaf nodes of the InputTree references an input that is not inputs
 */
export function TreeToCircuit(tree: InputTree, inputs: Map<string, DigitalComponent>, output: DigitalComponent): IOObject[] {
    if(tree === null)
        return [];

    let ret: IOObject[] = Array.from(inputs.values());

    ret = treeToCircuitCore(tree, inputs, ret);
    const wire = ConnectGate(ret.slice(-1)[0] as DigitalComponent, output);
    ret.push(wire);
    ret.push(output);
    return ret;

}

/**
 * Gets a new instance of the inverted version of the supplied gate
 * 
 * @param oldGate the gate to get the inverted version of
 * @returns NANDGate when supplied with an ANDGate, NORGate when supplied with an ORGate,
 *              XNORGate when supplied with a XORGate, null otherwise
 */
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

/**
 * Replaces oldGate with the inverted version of itself. oldGate must be in circuit.
 * 
 * @param oldGate the gate to replaced
 * @param circuit the circuit containing oldGate, this variable is edited in place
 * @returns the circuit with oldGate replaced by an inverted version
 * @see getNottedGate
 */
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

/**
 * Replaces AND/OR/XOR gates followed by NOT gates with NAND/NOR/XNOR gates.
 * 
 * @param circuit the circuit to process
 * @returns a copy of the circuit with the negation simplifications made
 */
export function CreateNegationGates(circuit: IOObject[]): IOObject[] {
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
 * @throws {Error} parenthesis do not include anything (such as "()")
 * @throws {Error} an opening parenthesis is missing a corresponding closing parenthesis (such as "(")
 * @throws {Error} a closing parenthesis is missing a corresponding opening parenthesis (such as ")")
 * @throws {Error} |, &, or ^ are missing an operand on their left (such as "a|")
 * @throws {Error} |, &, ^, or ! are missing an operand on their right (such as "!a")
 * @throws {Error} there is no operator between two inputs (such as "a b")
 * @throws {Error} the expression references an input not found in inputs
 * @throws {Error} if ops is missing the keys "|", "^", "&", "(", ")", or "separator"
 * @throws {Error} if the value in ops for keys "|", "^", "&", "(", ")", or "separator" is ""
 */
export function ExpressionToCircuit(inputs: Map<string, DigitalComponent>,
                                    expression: string,
                                    output: DigitalComponent,
                                    ops: Map<FormatLabels, string> = FormatMap.get("|")): DigitalObjectSet | null {

    validateInputOutputTypes(inputs, output);

    const tokenList = GenerateTokens(expression, ops);

    const connectedTree = GenerateInputTree(tokenList, ops);

    const fullCircuit = TreeToCircuit(connectedTree, inputs, output);

    const condensedCircuit = CreateNegationGates(fullCircuit);

    return new DigitalObjectSet(condensedCircuit);
}