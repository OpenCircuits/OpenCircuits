/**
 * Checks if the substring of a given input starting at a given index is equal to a given sequence
 * 
 * @param input the input string that a substring of will be examined
 * @param index the starting index of input to compare at
 * @param sequence the sequence to check equality with
 * @return true if input has a substring starting at index that matches sequence, false otherwise
 */
export function SubStrEquals(input: string, index: number, sequence: string): boolean {
    return input.substring(index, index + sequence.length) === sequence;
}