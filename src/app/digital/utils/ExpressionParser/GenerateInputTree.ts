import {BinOpChildren, InputToken, InputTree, InputTreeBinOpNode, InputTreeBinOpType,
        Token, TokenType} from "./Constants/DataStructures";
import {FORMATS} from "./Constants/Formats";


/** Used to return current index and currently built tree in core tree generation function. */
interface NewTreeRetValue {
    index: number;
    tree: InputTree;
    // indicates to the program that the tree in this return value should not be used for merging into a larger gate
    final?: boolean;
}

const DefaultPrecedences: TokenType[] = ["|", "^", "&", "!", "("];

/**
 * Checks if the input tree can have its number of inputs increased.
 *
 * @param tree    The tree to check.
 * @param op      The operation the tree should have.
 * @param isFinal Whether or not the tree can be modified.
 * @returns         True if tree has kind "binop", tree's type is op, and isFinal is false or undefined,
 *          false otherwise.
 */
function isTreeExtendable(tree: InputTree, op: InputTreeBinOpType, isFinal?: boolean): tree is InputTreeBinOpNode {
    return tree.kind === "binop" && tree.type === op && !isFinal;
}

/**
 * Generates a nested tree structure where each layer has at most 8 children.
 *
 * @param children  The array of children to turn into a nested structure.
 * @param currentOp The operand all these nodes have.
 * @returns           The properly nested tree structure.
 */
function generateNestedTrees(children: InputTree[], currentOp: InputTreeBinOpType): InputTree[] {
    if (children.length <= 8)
        return children;
    const next = children.slice(7);
    const newTree: InputTree = {
        kind: "binop", type: currentOp, isNot: false,

        children: generateNestedTrees(next, currentOp) as BinOpChildren,
    };
    return [...children.slice(0, 7), newTree];
}

/**
 * Generates a specific error message when no operator is detected between two tokens.
 * This message searches to see if one of the tokens is the operator for a different format.
 *
 * @param prev The name of the first token.
 * @param next The name of the second token.
 * @param ops  The represenation of the operands in the original expression.
 * @returns      The generate error message.
 */
function generateErrorMessage(prev: string, next: string, ops: Record<TokenType, string>): string {
    let errorMessage = `No valid operator between "${prev}" and "${next}"`;
    for (const format of FORMATS) {
        Object.entries(format.ops).forEach(([tokenType, op]) => {
            if (op === prev)
                errorMessage += `\nDid you mean to use "${ops[tokenType as TokenType]}" instead of "${prev}"?`
            if (op === next)
                errorMessage += `\nDid you mean to use "${ops[tokenType as TokenType]}" instead of "${next}"?`
        });
    }
    return errorMessage;
}

/**
 * The core of the function to generate the input tree. Various errors are returned for invalid inputs.
 *  It is recommended to not call this function directly and instead call GenerateInputTree.
 *
 * @param    tokens       The array of tokens representing the expression to parse.
 * @param    ops          The represenation of the operands in the original expression,
 *                        only used for error text formatting.
 * @param    currentOpNum The index of the current operation to evaluate.
 * @param    index        The index of the parsing process in the tokens Array.
 * @returns               The current input tree and the current parsing index.
 * @throws {Error} Parenthesis do not include anything (such as "()").
 * @throws {Error} An opening parenthesis is missing a corresponding closing parenthesis (such as "(a").
 * @throws {Error} A closing parenthesis is missing a corresponding opening parenthesis (such as ")a").
 * @throws {Error} `|`, `&`, or `^` are missing an operand on their left (such as "a|").
 * @throws {Error} `|`, `&`, `^`, or `!` are missing an operand on their right (such as "!a").
 * @see GenerateInputTree
 */
function generateInputTreeCore(tokens: Token[], ops: Record<TokenType, string>,
                               currentOpNum = 0, index = 0): NewTreeRetValue {
    const nextOpNum = (currentOpNum+1) % DefaultPrecedences.length;
    const currentOp = DefaultPrecedences[currentOpNum];
    if (tokens[index].type === ")") {
        if (index > 0) {
            const prevTokenType = tokens[index-1].type;
            if (prevTokenType === "(")
                throw new Error("Empty Parenthesis");
            if (prevTokenType !== ")" && prevTokenType !== "input")
                throw new Error(`Missing Right Operand: "${ops[prevTokenType]}"`);
        }
        throw new Error(`Encountered Unmatched "${ops[")"]}"`);
    }

    // When this function has recursed through to "!" and the token still isn't that, then
    //  the only possibilites left are an input or open parenthesis token
    if (currentOp === "!" && tokens[index].type !== "!") {
        const token = tokens[index];
        if (token.type === "(")
            return generateInputTreeCore(tokens, ops, nextOpNum, index);
        if (token.type === "input")
            return { index: index+1, tree: { kind: "leaf", ident: token.name } };
        throw new Error(`Missing Left Operand: "${ops[token.type]}"`);
    }

    // This section gets the part of the tree from the left side of the operator.
    //  "!" and "(" only have operands on their right side, so this section is skipped for them
    let leftRet: NewTreeRetValue;
    if (currentOp === "|" || currentOp === "^" || currentOp === "&") {
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
        throw new Error(`Missing Right Operand: "${ops[currentOp]}"`);
    }
    let rightRet: NewTreeRetValue;
    const rightToken = tokens[index];
    if (currentOp === "!" && rightToken.type === "!") { // This case applies when there are two !'s in a row
        rightRet = generateInputTreeCore(tokens, ops, currentOpNum, index);
    } else if (currentOp === "!" && rightToken.type === "input") { // This case would apply when an input follows a "!"
        rightRet = { index: index+1, tree: { kind: "leaf", ident: rightToken.name } };
    } else if (currentOp === "(") {
        if (index >= tokens.length)
            throw new Error(`Encountered Unmatched "${ops["("]}"`);
        rightRet = generateInputTreeCore(tokens, ops, nextOpNum, index);
    } else {
        rightRet = generateInputTreeCore(tokens, ops, currentOpNum, index);
    }
    index = rightRet.index;
    if (currentOp === "(") {
        if (index >= tokens.length)
            throw new Error(`Encountered Unmatched "${ops["("]}"`);
        if (tokens[index].type !== ")")
            throw new Error(`Encountered Unmatched "${ops["("]}"`);
        rightRet.index += 1; // Incremented to skip the ")"
        rightRet.final = true; // used to not combine gates in (a|b)|(c|d) for example
        return rightRet;
    }

    // The tree tree is created with the new node as the root and returned
    let tree: InputTree;
    if (currentOp === "!") {
        const rTree = rightRet.tree;
        if (rTree.kind === "binop" && !rTree.isNot) {
            tree = rTree;
            tree.isNot = true;
        }
        else {
            tree = { kind: "unop", type: "!", child: rightRet.tree };
        }
    }
    else if (currentOp === "|" || currentOp === "^" || currentOp === "&") {
        const lTree = leftRet!.tree, rTree = rightRet.tree;
        let childrenArray = isTreeExtendable(lTree, currentOp, leftRet!.final)
                            ? lTree.children as InputTree[]
                            : [lTree];
        if (isTreeExtendable(rTree, currentOp, rightRet.final))
            childrenArray = [...childrenArray, ...rTree.children as InputTree[]];
        else
            childrenArray.push(rTree);

        childrenArray = generateNestedTrees(childrenArray, currentOp);

        tree = { kind: "binop", type: currentOp, isNot: false, children: childrenArray as BinOpChildren };
    }
    return { index: index, tree: tree! };

}

/**
 * The core of the function to generate the input tree. Various errors are returned for invalid inputs.
 *
 * @param    tokens The array of tokens representing the expression to parse.
 * @param    ops    The representation format for the operations used in this expression (only used for error messages).
 * @returns         `undefined` if tokens.length is 0, the relevant input tree otherwise.
 * @throws {Error} Parenthesis do not include anything (such as "()").
 * @throws {Error} An opening parenthesis is missing a corresponding closing parenthesis (such as "(").
 * @throws {Error} A closing parenthesis is missing a corresponding opening parenthesis (such as ")").
 * @throws {Error} `|`, `&`, or `^` are missing an operand on their left (such as "a|").
 * @throws {Error} `|`, `&`, `^`, or `!` are missing an operand on their right (such as "!a").
 * @throws {Error} There is no operator between two inputs (such as "a b").
 * @throws {Error} `generateInputTreeCore` returns back up to this function before the end of tokens is reached
 *                  for any other reason.
 */
export function GenerateInputTree(tokens: Token[], ops = FORMATS[0].ops): InputTree | undefined {
    if (tokens.length === 0)
        return;
    const ret = generateInputTreeCore(tokens, ops);

    const index = ret.index;
    if (index < tokens.length) {
        if (tokens[index].type === ")")
            throw new Error(`Encountered Unmatched "${ops[")"]}"`);

        const prev = tokens.slice(0, index) // Decrementing through the array starting at right before the returned index
                           .reverse()
                           .find((token) => token.type === "input") as InputToken;
        const next = tokens.slice(index)
                           .find((token) => token.type === "input") as InputToken;
        if (prev && prev.name && next && next.name)
            throw new Error(generateErrorMessage(prev.name, next.name, ops));

        throw new Error("Parsing ended prematurely");
    }

    return ret.tree;
}
