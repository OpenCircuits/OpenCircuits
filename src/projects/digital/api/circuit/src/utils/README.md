# Digital Utilities (`utils`)

This directory contains utility functions specific to digital logic and simulation.

## Files
- **`MathUtil.ts`**: Provides helper functions (`BCDtoDecimal` and `DecimalToBCD`) to seamlessly convert between arrays of boolean digital signals (Binary-Coded Decimal) and numeric decimal values. This is heavily utilized by components like the `Multiplexer`, `Decoder`, and `Comparator` to process input signals as bundled numeric values.
