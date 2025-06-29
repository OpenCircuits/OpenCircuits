

export class DirtyVar<T> {
    private isDirty: boolean;
    private variable?: T;

    private readonly update: () => T;

    private readonly children: Set<DirtyVar<unknown>>;


    public constructor(update: () => T, parent?: DirtyVar<unknown>) {
        this.isDirty = true;
        this.update = update;
        this.children = new Set();

        // Add oursevles to the parent set
        if (parent)
            parent.children.add(this);
    }

    public setDirty(): void {
        this.isDirty = true;

        this.children.forEach((c) => c.setDirty());
    }

    public get(): T {
        if (this.isDirty) {
            this.isDirty = false;
            this.variable = this.update();
        }
        return this.variable!;
    }
}
