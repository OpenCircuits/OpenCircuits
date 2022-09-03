/**
 * Checks if the substring of a given input starting at a given index is equal to a given sequence.
 *
 * @param input    The input string that a substring of will be examined.
 * @param index    The starting index of input to compare at.
 * @param sequence The sequence to check equality with.
 * @returns          True if input has a substring starting at index that matches sequence, false otherwise.
 */
export function SubStrEquals(input: string, index: number, sequence: string): boolean {
    return input.slice(index, index + sequence.length) === sequence;
}
