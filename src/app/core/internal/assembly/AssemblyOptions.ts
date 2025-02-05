export interface AssemblyOptions {
    defaultBorderWidth: number;

    defaultPortLength: number;
    defaultPortRadius: number;
}

export class DefaultAssemblyOptions implements AssemblyOptions {
    public defaultBorderWidth = 0.04;

    public defaultPortLength = 0.7;
    public defaultPortRadius = 0.14;
}
