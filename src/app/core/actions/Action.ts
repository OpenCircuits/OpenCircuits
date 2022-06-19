
export interface Action {
    execute(): Action;
    undo(): Action;
    getName(): string;
    getCustomInfo?(): string[] | undefined;
}
