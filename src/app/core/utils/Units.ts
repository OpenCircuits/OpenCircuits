/* eslint-disable key-spacing */
import {NumberPropInfo, PropInfo, UnitInfo} from "core/models/PropInfo";


export const Unit = (sym: string, name:  string) => ({
      "T": { name: `Terra-${name}`, display: `T${sym}`, val: 1e12  },
      "G": { name:  `Giga-${name}`, display: `G${sym}`, val: 1e9   },
    "Meg": { name:  `Mega-${name}`, display: `M${sym}`, val: 1e6   },
      "k": { name:  `Kilo-${name}`, display: `k${sym}`, val: 1e3   },
      " ": { name:       `${name}`, display:  `${sym}`, val: 1     },
      "m": { name: `milli-${name}`, display: `m${sym}`, val: 1e-3  },
      "u": { name: `micro-${name}`, display: `u${sym}`, val: 1e-6  },
      "n": { name:  `nano-${name}`, display: `n${sym}`, val: 1e-9  },
      "p": { name:  `pico-${name}`, display: `p${sym}`, val: 1e-12 },
      "f": { name: `femto-${name}`, display: `f${sym}`, val: 1e-15 },
});


export type UnitKey = keyof ReturnType<typeof Unit>;
export type UnitNumberInfoProps = Omit<NumberPropInfo, "type"|"unit"|"initial"> & { unit: UnitInfo };
export const UnitNumberInfo = (key: string, props: UnitNumberInfoProps,
                        initial: number, initialU: UnitKey): Record<string, PropInfo> => ({
    [key]: {
        type: "float" as const,
        initial: initial * props.unit[initialU].val,
        ...props,
    },
    [`${key}_U`]: {
        type: "string[]" as const,
        isActive: () => false, // This is a "hidden" property
        display: "",
        initial: initialU,
        options: Object.entries(props.unit).map(([key, val]) => [val.display, key]),
    },
});

export const TimeInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("s", "Second"), min: 0 },
    initial, initialU,
);

export const FrequencyInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("Hz", "Hertz"), min: 0 },
    initial, initialU,
);

export const AngleInfo = (key: string, display: string, initial = 0) => ({
    [key]: {
        type: "float" as const,
        display, initial,
        min: 0, max: 360, step: 1,
    },
});
