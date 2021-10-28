import { TokenType, FormatLabels } from "./DataStructures";


export const OpsArray: Array<TokenType> = ["(", ")", "&", "^", "|", "!"] as  Array<TokenType>;

export const DefaultPrecedences = new Map<TokenType, TokenType>([
    ["|", "^"],
    ["^", "&"],
    ["&", "!"],
    ["!", "("],
    ["(", "|"],
]);

export const TypeToGate = new Map<string, string>([
    ["&", "ANDGate"],
    ["!", "NOTGate"],
    ["|", "ORGate"],
    ["^", "XORGate"],
]);

const programming1 = new Map<FormatLabels, string>([
    ["label", "Programming 1 (&, |, ^, !)"],
    ["|", "|"],
    ["^", "^"],
    ["&", "&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const programming2 = new Map<FormatLabels, string>([
    ["label", "Programming 2 (&&, ||, ^, !)"],
    ["|", "||"],
    ["^", "^"],
    ["&", "&&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic1 = new Map<FormatLabels, string>([
    ["label", "Algebraic 1 (*, +, ^, !)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic2 = new Map<FormatLabels, string>([
    ["label", "Algebraic 2 (*, +, ^, _)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "_"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal1 = new Map<FormatLabels, string>([
    ["label", "Literal 1 (AND, OR, XOR, NOT)"],
    ["|", "OR"],
    ["^", "XOR"],
    ["&", "AND"],
    ["!", "NOT"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal2 = new Map<FormatLabels, string>([
    ["label", "Literal 2 (and, or, xor, not)"],
    ["|", "or"],
    ["^", "xor"],
    ["&", "and"],
    ["!", "not"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);

export const FormatMap = new Map<string, Map<FormatLabels, string>>([
    ["|", programming1],
    ["||", programming2],
    ["+", algebraic1],
    ["+_", algebraic2],
    ["OR", literal1],
    ["or", literal2],
]);