
/**
 * Utility to function to check if the given variable is an Error.
 *
 * @param e Any object.
 * @returns   Whether or not `e` is an Error.
 */
export function isError(e: unknown): e is Error {
    return (!!e) && (typeof e === "object") && ("name" in e) && ("stack" in e);
}


/**
 * Utility function to get the stack trace from an Error.
 *
 * @param e An Error.
 * @returns   The stack trace as a string from the error.
 */
export function getStackTrace(e: Error): string[] {
    const stack = (e.stack || "").split("\n").map((l) => l.trim());
    return stack.splice(stack[0] === "Error" ? 2 : 1);
}
