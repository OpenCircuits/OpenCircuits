export type FormatProps = "label" | "|" | "^" | "&" | "!" | "(" | ")" | "separator";

const programming1 = new Map<FormatProps, string>([
    ["label", "Programming 1 (&, |, ^, !)"],
    ["|", "|"],
    ["^", "^"],
    ["&", "&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const programming2 = new Map<FormatProps, string>([
    ["label", "Programming 2 (&&, ||, ^, !)"],
    ["|", "||"],
    ["^", "^"],
    ["&", "&&"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic1 = new Map<FormatProps, string>([
    ["label", "Algebraic 1 (*, +, ^, !)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "!"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const algebraic2 = new Map<FormatProps, string>([
    ["label", "Algebraic 2 (*, +, ^, _)"],
    ["|", "+"],
    ["^", "^"],
    ["&", "*"],
    ["!", "_"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal1 = new Map<FormatProps, string>([
    ["label", "Literal 1 (AND, OR, XOR, NOT)"],
    ["|", "OR"],
    ["^", "XOR"],
    ["&", "AND"],
    ["!", "NOT"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);
const literal2 = new Map<FormatProps, string>([
    ["label", "Literal 2 (and, or, xor, not)"],
    ["|", "or"],
    ["^", "xor"],
    ["&", "and"],
    ["!", "not"],
    ["(", "("],
    [")", ")"],
    ["separator", " "]
]);

export const FormatMap = new Map<string, Map<FormatProps, string>>([
    ["|", programming1],
    ["||", programming2],
    ["+", algebraic1],
    ["+_", algebraic2],
    ["OR", literal1],
    ["or", literal2],
]);