import {ASCIIFont} from "./ASCIIFont";


export const BCDFont: Record<string, number[][]> =
    Object.fromEntries(
        Object.entries(ASCIIFont).map(
                                    // Get values 0-9   and vals  A-F
            ([key, val]) => [key, [...val.slice(48, 58), ...val.slice(65, 71)]]
        )
    );
