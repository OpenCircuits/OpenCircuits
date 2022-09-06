import {InputToken, OperatorFormat, Token, TokenType} from "./Constants/DataStructures";

import {SubStrEquals} from "core/utils/StringUtils";


const TokenTypesArray: TokenType[] = ["(", ")", "&", "^", "|", "!"];

/**
 * Extracts the input name from an expression starting at a certain location.
 *
 * @param expression The expression to extract the input name from.
 * @param index      The index at which the input starts.
 * @param ops        The representation format for the operations used in this expression.
 * @returns            An InputToken with the input name in it.
 */
function getInput(expression: string, index: number, ops: OperatorFormat): InputToken {
    const endIndex = Array.from({ length: expression.length - index - 1 }, (_, i) => i + index + 1)
                          .find((endIndex) =>
                               // Check if the substring from index to endIndex is a token [|, ^, &, !, (, )]
                               TokenTypesArray.find((tokenType) => SubStrEquals(expression,
                                                                                endIndex,
                                                                                ops.ops[tokenType]))
                               // Check if the substring from index to endIndex is the separator, usually " "
                               || SubStrEquals(expression, endIndex, ops.separator)
                          );
    if (endIndex)
        return { type: "input", name: expression.slice(index, endIndex) };
    return { type: "input", name: expression.slice(index, expression.length) };
}

/**
 * Gets a token from a given expression starting at a certain index.
 *
 * @param expression The expression to extract the token from.
 * @param index      The index where the token starts.
 * @param ops        The representation format for the operations used in this expression.
 * @returns            The token extracted from the expression or null if the index points to the starting location of
 *             a separator (like " ").
 */
function getToken(expression: string, index: number, ops: OperatorFormat): Token | undefined {
    const tokenType = TokenTypesArray.find((tokenType) => SubStrEquals(expression, index, ops.ops[tokenType]));
    if (tokenType)
        return { type: tokenType };
    if (SubStrEquals(expression, index, ops.separator))
        return;
    return getInput(expression, index, ops);
}

/**
 * Converts the given expression to an array of tokens.
 *
 * @param    expression The expression to convert.
 * @param    ops        The representation format for the operations used in this expression.
 * @returns             A list of tokens that represent the given expression.
 * @throws {Error} If ops is missing the keys "|", "^", "&", "(", ")", or "separator".
 * @throws {Error} If the value in ops for keys "|", "^", "&", "(", ")", or "separator" is "".
 */
export function GenerateTokens(expression: string, ops: OperatorFormat): Token[] {
    for (const tokenType of TokenTypesArray) {
        if (ops.ops[tokenType] === "")
            throw new Error("Length zero " + tokenType + " in supplied operation symbols");
    }
    if (ops.separator === "")
        throw new Error("Length zero separator in supplied operation symbols");

    const tokenList = new Array<Token>();
    let token: Token | undefined;
    let index = 0;

    while (index < expression.length) {
        token = getToken(expression, index, ops);
        if (!token) {
            index += ops.separator.length;
        } else if (token.type === "input") {
            tokenList.push(token);
            index += token.name.length;
        } else {
            tokenList.push(token);
            index += ops.ops[token.type].length;
        }
    }

    return tokenList;
}
