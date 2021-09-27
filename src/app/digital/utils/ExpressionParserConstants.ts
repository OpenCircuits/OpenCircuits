import {DigitalComponent} from "digital/models/index";
import {ANDGate} from "digital/models/ioobjects/gates/ANDGate";
import {ORGate} from "digital/models/ioobjects/gates/ORGate";
import {NOTGate} from "digital/models/ioobjects/gates/BUFGate";
import {XORGate} from "digital/models/ioobjects/gates/XORGate";
import {Graph} from "math/Graph";

export type InputTreeBinOpType = "|" | "^" | "&"
export type InputTreeUnOpType = "!"

export interface InputTreeIdent {
    kind: "leaf"
    ident: string
}
export interface InputTreeUnOpNode {
    kind: "unop"
    type: InputTreeUnOpType
    child: InputTree
}
export interface InputTreeBinOpNode {
    kind: "binop"
    type: InputTreeBinOpType
    lChild: InputTree
    rChild: InputTree
}
export type InputTree =
    | InputTreeIdent
    | InputTreeUnOpNode
    | InputTreeBinOpNode

export type TokenType = "label" | "|" | "^" | "&" | "!" | "(" | ")" | "separator";

export interface Token {
    type: TokenType;
}

export interface InputToken extends Token {
    name: string;
}

export interface NewTreeRetValue {
    index: number;
    tree: InputTree;
}

export interface TreeRetValue {
    graph: Graph<Token, boolean>;
    index: number;
    recent: Token;
}

export const OpsArray: Array<TokenType> = ["separator", "(", ")", "&", "^", "|", "!"] as  Array<TokenType>;

export const GateConstructors = new Map<string, () => DigitalComponent>([
    ["|", () => new ORGate()],
    ["^", () => new XORGate()],
    ["&", () => new ANDGate()],
    ["!", () => new NOTGate()],
]);

export const DefaultPrecedences = new Map<TokenType, TokenType>([
    ["|", "^"],
    ["^", "&"],
    ["&", "!"],
    ["!", "("],
    ["(", "|"],
]);

const programming1 = new Map<TokenType, string>([
    ["label", "Programming 1 (&, |, ^, !)"],
    ["|", "|"],
    ["^", "^"],
    ["&", "&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const programming2 = new Map<TokenType, string>([
    ["label", "Programming 2 (&&, ||, ^, !)"],
    ["|", "||"],
    ["^", "^"],
    ["&", "&&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic1 = new Map<TokenType, string>([
    ["label", "Algebraic 1 (*, +, ^, !)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic2 = new Map<TokenType, string>([
    ["label", "Algebraic 2 (*, +, ^, _)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "_"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal1 = new Map<TokenType, string>([
    ["label", "Literal 1 (AND, OR, XOR, NOT)"],
    ["|", "OR"],
    ["^", "XOR"],
    ["&", "AND"],
    ["!", "NOT"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal2 = new Map<TokenType, string>([
    ["label", "Literal 2 (and, or, xor, not)"],
    ["|", "or"],
    ["^", "xor"],
    ["&", "and"],
    ["!", "not"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);

export const FormatMap = new Map<string, Map<TokenType, string>>([
    ["|", programming1],
    ["||", programming2],
    ["+", algebraic1],
    ["+_", algebraic2],
    ["OR", literal1],
    ["or", literal2],
]);