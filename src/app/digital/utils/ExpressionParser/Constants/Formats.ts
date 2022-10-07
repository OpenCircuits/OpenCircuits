import {OperatorFormat} from "./DataStructures";


const programming1: Readonly<OperatorFormat> = {
    label:     "Programming 1 (&, |, ^, !)",
    separator: " ",
    icon:      "|",

    ops: {
        "|": "|",
        "^": "^",
        "&": "&",
        "!": "!",
        "(": "(",
        ")": ")",
    },
}
const programming2: Readonly<OperatorFormat> = {
    label:     "Programming 2 (&&, ||, ^, !)",
    separator: " ",
    icon:      "||",

    ops: {
        "|": "||",
        "^": "^",
        "&": "&&",
        "!": "!",
        "(": "(",
        ")": ")",
    },
}
const algebraic1: Readonly<OperatorFormat> = {
    label:     "Algebraic 1 (*, +, ^, !)",
    separator: " ",
    icon:      "+",

    ops: {
        "|": "+",
        "^": "^",
        "&": "*",
        "!": "!",
        "(": "(",
        ")": ")",
    },
}
const algebraic2: Readonly<OperatorFormat> = {
    label:     "Algebraic 2 (*, +, ^, _)",
    separator: " ",
    icon:      "+_",

    ops: {
        "|": "+",
        "^": "^",
        "&": "*",
        "!": "_",
        "(": "(",
        ")": ")",
    },
}
const literal1: Readonly<OperatorFormat> = {
    label:     "Literal 1 (AND, OR, XOR, NOT)",
    separator: " ",
    icon:      "OR",

    ops: {
        "|": "OR",
        "^": "XOR",
        "&": "AND",
        "!": "NOT",
        "(": "(",
        ")": ")",
    },
}
const literal2: Readonly<OperatorFormat> = {
    label:     "Literal 2 (and, or, xor, not)",
    separator: " ",
    icon:      "or",

    ops: {
        "|": "or",
        "^": "xor",
        "&": "and",
        "!": "not",
        "(": "(",
        ")": ")",
    },
}

/**
 * Stores the different types of preset formats.
 * If any new formats are added, they must be added to the end of the array.
 */
export const FORMATS = [
    programming1,
    programming2,
    algebraic1,
    algebraic2,
    literal1,
    literal2,
];
