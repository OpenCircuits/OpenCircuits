export type InputTreeBinOpType = "|" | "^" | "&"
export type InputTreeUnOpType = "!"
export type ParenType = "(" | ")";
export type TokenType = 
    | InputTreeBinOpType
    | InputTreeUnOpType
    | ParenType;

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

export interface OpToken {
    type: TokenType;
}
export interface InputToken {
    type: "input"
    name: string;
}
export type Token = 
    | OpToken
    | InputToken;

export interface NewTreeRetValue {
    index: number;
    tree: InputTree;
}

export type FormatLabels = "label" | "separator" | TokenType;