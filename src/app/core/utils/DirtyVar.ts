

export class DirtyVar<T> {
    private isDirty: boolean;
    private variable: T;

    private readonly update: () => T;

    public constructor(update: () => T) {
        this.isDirty = true;
        this.update = update;
    }

    public setDirty(): void {
        this.isDirty = true;
    }

    public get(): T {
        if (this.isDirty) {
            this.isDirty = false;
            this.variable = this.update();
        }
        return this.variable;
    }
}
