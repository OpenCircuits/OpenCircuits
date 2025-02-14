// Encapsulates an error with multiple levels of semantic information
export class MultiError {
    private readonly errs: Error[]
    public constructor(errors: Error[]) {
        this.errs = errors;
    }

    public append(e: Error): MultiError {
        this.errs.push(e);
        return this;
    }

    public get errors(): readonly Error[] {
        return this.errs;
    }
}

export function AddErr(e: Error): (m: MultiError) => MultiError {
    return (m) => m.append(e);
}
export function AddErrE(e: string): (m: MultiError) => MultiError {
    return (m) => m.append(new Error(e));
}
