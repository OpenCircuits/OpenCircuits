
export interface Action {
    execute(): Action;
    undo(): Action;
    getName(): string;
}
