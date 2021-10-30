import {SubEquals} from "core/utils/StringUtils";
import {FormatLabels, InputToken, Token} from "./Constants/DataStructures";
import {OpsArray} from "./Constants/Objects";


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
            if (SubEquals(expression, endIndex, ops.get(op)))
                return {type: "input", name: expression.substring(index, endIndex)};
        }
        if (SubEquals(expression, endIndex, ops.get("separator")))
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
        if (SubEquals(expression, index, ops.get(op)))
            return {type: op};
    }
    if (SubEquals(expression, index, ops.get("separator")))
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
        if (!ops.has(op))
            throw new Error("No " + op + " in supplied operation symbols");
        if (ops.get(op) === "")
            throw new Error("Length zero " + op + " in supplied operation symbols");
    }
    if (!ops.has("separator"))
        throw new Error("No separator in supplied operation symbols");
    if (ops.get("separator") === "")
        throw new Error("Length zero separator in supplied operation symbols");

    const tokenList = new Array<Token>();
    let extraSkip = 0;
    let token: Token;

    let index = 0;

    while(index < expression.length) {
        extraSkip = 0;

        token = getToken(expression, index, ops);
        if (token === null)
            index += ops.get("separator").length;
        else if (token.type === "input") {
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