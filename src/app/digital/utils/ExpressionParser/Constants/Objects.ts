import {InputTreeOpType, OperatorFormat, TokenType} from "./DataStructures";


export const TokenTypesArray: Array<TokenType> = ["(", ")", "&", "^", "|", "!"];

export const DefaultPrecedences: Array<TokenType> = ["|", "^", "&", "!", "("];

export const TypeToGate: Record<InputTreeOpType, string> = {
    "&": "ANDGate",
    "!": "NOTGate",
    "|": "ORGate",
    "^": "XORGate",
}

const programming1: OperatorFormat = {
    label: "Programming 1 (&, |, ^, !)",
    separator: " ",
    icon: "|",
    ops: {
        "|": "|",
        "^": "^",
        "&": "&",
        "!": "!",
        "(": "(",
        ")": ")",
    }
}
const programming2: OperatorFormat = {
    label: "Programming 2 (&&, ||, ^, !)",
    separator: " ",
    icon: "||",
    ops: {
        "|": "||",
        "^": "^",
        "&": "&&",
        "!": "!",
        "(": "(",
        ")": ")",
    }
}
const algebraic1: OperatorFormat = {
    label: "Algebraic 1 (*, +, ^, !)",
    separator: " ",
    icon: "+",
    ops: {
        "|": "+",
        "^": "^",
        "&": "*",
        "!": "!",
        "(": "(",
        ")": ")",
    }
}
const algebraic2: OperatorFormat = {
    label: "Algebraic 2 (*, +, ^, _)",
    separator: " ",
    icon: "+_",
    ops: {
        "|": "+",
        "^": "^",
        "&": "*",
        "!": "_",
        "(": "(",
        ")": ")",
    }
}
const literal1: OperatorFormat = {
    label: "Literal 1 (AND, OR, XOR, NOT)",
    separator: " ",
    icon: "OR",
    ops: {
        "|": "OR",
        "^": "XOR",
        "&": "AND",
        "!": "NOT",
        "(": "(",
        ")": ")",
    }
}
const literal2: OperatorFormat = {
    label: "Literal 2 (and, or, xor, not)",
    separator: " ",
    icon: "or",
    ops: {
        "|": "or",
        "^": "xor",
        "&": "and",
        "!": "not",
        "(": "(",
        ")": ")",
    }
}

export const Formats = [
    programming1, // Must be at the first spot in this array
    programming2,
    algebraic1,
    algebraic2,
    literal1,
    literal2,
];