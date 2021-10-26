import { DefaultPrecedences, FormatLabels, FormatMap, InputTree, NewTreeRetValue, Token, TokenType } from "./Constants";
import { IsOperator } from "./Utils";


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
            else if(IsOperator(tokens[index-1]))
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