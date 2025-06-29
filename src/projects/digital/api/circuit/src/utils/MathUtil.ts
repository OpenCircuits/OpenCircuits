/**
 * Calculates the decimal value of a binary-coded-decimal
 *  represented by a list of booleans.
 *
 * @param bcd The binary-coded-decimal as a list of booleans.
 * @returns   The decimal equivalent of the binary-coded-decimal.
 */
export function BCDtoDecimal(bcd: boolean[]): number {
    return bcd.reduce((sum, on, i) => sum + (on ? 1 << i : 0), 0);
}

/**
 * Calculates the BCD representation of the input number.
 *
 * @param decimal    The number to convert (`decimal >= 0`).
 * @param outputSize A specified output size for the BCD.
 * @throws An Error if decimal is not a valid integer `>= 0`.
 * @returns          The BCD representation of the input.
 */
export function DecimalToBCD(decimal: number, outputSize?: number): boolean[] {
    if (!Number.isInteger(decimal) || decimal < 0)
        throw "input must be a nonnegative integer";
    // Minimum number of digits for BCD
    const minSize = (decimal === 0 ? 1 : Math.floor(Math.log2(decimal)+1));
    return new Array<boolean>(outputSize ?? minSize)
        .fill(false)
        .map((_, i) => ((decimal & (1 << i)) >> i))
        .map((bit) => (bit === 1));
}
