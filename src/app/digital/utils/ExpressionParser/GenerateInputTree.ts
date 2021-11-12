import {Token, TokenType, InputTree, OperatorFormat, InputToken} from "./Constants/DataStructures";
import {Formats} from "./Constants/Formats";


/** Used to return current index and currently built tree in core tree generation function */
interface NewTreeRetValue {
    index: number;
    tree: InputTree;
}

const DefaultPrecedences: TokenType[] = ["|", "^", "&", "!", "("];

/**
 * The core of the function to generate the input tree. Various errors are returned for invalid inputs.
 *  It is recommended to not call this function directly and instead call GenerateInputTree
 * 
 * @param tokens the array of tokens representing the expression to parse
 * @param ops the represenation of the operands in the original expression, only used for error text formatting
 * @param currentOpNum the index of the current operation to evaluate
 * @param index the index of the parsing process in the tokens Array
 * @returns the current input tree and the current parsing index
 * @throws {Error} parenthesis do not include anything (such as "()")
 * @throws {Error} an opening parenthesis is missing a corresponding closing parenthesis (such as "(a")
 * @throws {Error} a closing parenthesis is missing a corresponding opening parenthesis (such as ")a")
 * @throws {Error} |, &, or ^ are missing an operand on their left (such as "a|")
 * @throws {Error} |, &, ^, or ! are missing an operand on their right (such as "!a")
 * @see GenerateInputTree
 */
 function generateInputTreeCore(tokens: Token[], ops: Record<TokenType, string>, currentOpNum: number = 0, index: number = 0): NewTreeRetValue {
    const nextOpNum = (currentOpNum+1) % DefaultPrecedences.length;
    const currentOp = DefaultPrecedences[currentOpNum];
    if (tokens[index].type === ")") {
        if (index > 0) {
            const prevTokenType = tokens[index-1].type;
            if (prevTokenType === "(")
                throw new Error("Empty Parenthesis");
            if (prevTokenType !== ")" && prevTokenType !== "input")
                throw new Error("Missing Right Operand: \"" + ops[prevTokenType] + "\"");
        }
        throw new Error("Encountered Unmatched \"" + ops[")"] + "\"");
    }

    // When this function has recursed through to "!" and the token still isn't that, then
    //  the only possibilites left are an input or open parenthesis token
    if (currentOp === "!" && tokens[index].type !== "!") {
        const token = tokens[index];
        if (token.type === "(")
            return generateInputTreeCore(tokens, ops, nextOpNum, index);
        if (token.type === "input")
            return {index: index+1, tree: {kind: "leaf", ident: token.name}};
        throw new Error("Missing Left Operand: \"" + ops[token.type] + "\"");
    }

    // This section gets the part of the tree from the left side of the operator.
    //  "!" and "(" only have operands on their right side, so this section is skipped for them
    let leftRet: NewTreeRetValue;
    if (currentOp !== "!" && currentOp !== "(") {
        leftRet = generateInputTreeCore(tokens, ops, nextOpNum, index);
        index = leftRet.index;
        // If this isn't the right operation to apply, return
        if (index >= tokens.length || tokens[index].type !== currentOp)
            return leftRet;
    }

    // This section gets the part of the tree from the right side of the operand. index is incremented by 1
    //  so it now points to the token on the right side of the operator.
    index += 1;
    if (index >= tokens.length && currentOp !== "(") {
        throw new Error("Missing Right Operand: \"" + ops[currentOp] + "\"");
    }
    let rightRet: NewTreeRetValue = null;
    const rightToken = tokens[index];
    if (currentOp === "!" && rightToken.type === "!") { // This case applies when there are two !'s in a row
        rightRet = generateInputTreeCore(tokens, ops, currentOpNum, index);
    } else if (currentOp === "!" && rightToken.type === "input") { // This case would apply when an input follows a "!"
        rightRet = {index: index+1, tree: {kind: "leaf", ident: rightToken.name}};
    } else if (currentOp === "(") {
        if (index >= tokens.length)
            throw new Error("Encountered Unmatched \"" + ops["("] + "\"");
        rightRet = generateInputTreeCore(tokens, ops, nextOpNum, index);
    } else {
        rightRet = generateInputTreeCore(tokens, ops, currentOpNum, index);
    }
    index = rightRet.index;
    if (currentOp === "(") {
        if (index >= tokens.length)
            throw new Error("Encountered Unmatched \"" + ops["("] + "\"");
        if (tokens[index].type !== ")")
            throw new Error("Encountered Unmatched \"" + ops["("] + "\"");
        rightRet.index += 1; // Incremented to skip the ")"
        return rightRet;
    }

    // The tree tree is created with the new node as the root and returned
    let tree: InputTree;
    if (currentOp === "!")
        tree = {kind: "unop", type: "!", child: rightRet.tree};
    else if (currentOp === "|" || currentOp === "^" || currentOp === "&")
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
export function GenerateInputTree(tokens: Token[], ops: Record<TokenType, string> = Formats[0].ops): InputTree | null {
    if (tokens.length === 0)
        return null;
    const ret = generateInputTreeCore(tokens, ops);

    const index = ret.index;
    if (index < tokens.length) {
        if (tokens[index].type === ")")
            throw new Error("Encountered Unmatched \"" + ops[")"] + "\"");

        const prev = tokens.slice(0, index) // Decrementing through the array starting at right before the returned index
                           .reverse()
                           .find(token => token.type === "input") as InputToken;
        const next = tokens.slice(index)
                           .find(token => token.type === "input") as InputToken;
        if (prev && prev.name && next && next.name)
            throw new Error("No valid operator between \"" + prev.name + "\" and \"" + next.name + "\"");

        throw new Error("Parsing ended prematurely");
    }

    return ret.tree;
}