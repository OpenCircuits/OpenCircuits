/** Represents the operand of a binary operation. */
export type InputTreeBinOpType = "|" | "^" | "&";
/** Represents the operand of a unary operation. */
export type InputTreeUnOpType = "!";
/** Represents operands of both unary and binary operations. */
export type InputTreeOpType = InputTreeBinOpType | InputTreeUnOpType;
export type ParenType = "(" | ")";
export type TokenType =
    | InputTreeOpType
    | ParenType;

/** Represents that a "binary" operation can have 2-8 children. */
export type BinOpChildren = [InputTree, InputTree, InputTree?, InputTree?,
                             InputTree?, InputTree?, InputTree?, InputTree?];

/** Represents a node on the parsed tree that itself represents an input component. */
export interface InputTreeIdent {
    kind: "leaf";
    ident: string;
}
/** Represents a node on the parsed tree that itself represents a unary operation. */
export interface InputTreeUnOpNode {
    kind: "unop";
    type: InputTreeUnOpType;
    child: InputTree;
}
/** Represents a node on the parsed tree that itself represents a binary operation. */
export interface InputTreeBinOpNode {
    kind: "binop";
    type: InputTreeBinOpType;
    isNot: boolean; // true for NAND, false for AND
    // Can have 2-8 children
    children: BinOpChildren;
}
/** Represents all possible types of nodes for the input tree. */
export type InputTree =
    | InputTreeIdent
    | InputTreeUnOpNode
    | InputTreeBinOpNode

/**
 * Used to represent a unary operation, binary operation, or parenthesis when parsing the intial expression
 * to a token list.
 */
export interface OpToken {
    type: TokenType;
}
/** Used to represent the token of an input component when parsing the initial expression to a token list. */
export interface InputToken {
    type: "input";
    name: string;
}
export type Token =
    | OpToken
    | InputToken;

/** When adding a new format, this type must also be expanded to include its new unique icon. */
export type OperatorFormatLabel = "|" | "||" | "+" | "+_" | "OR" | "or" | "custom";

/** Represents a format to represent the operators in the expression. */
export type OperatorFormat = {
    label: string; // Text displayed to explain the OperatorFormat
    separator: string;
    icon: OperatorFormatLabel; // All icons should be unique (and "custom" should be reserved for frontend)
    ops: Record<TokenType, string>;
}
