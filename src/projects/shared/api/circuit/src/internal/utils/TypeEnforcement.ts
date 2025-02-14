// See https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html
export function assertNever(x: never): never {
    throw new Error("Unexpeted object: " + x);
}
