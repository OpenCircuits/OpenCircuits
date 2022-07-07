import {Unit, UnitKey, UnitNumberInfo} from "core/utils/Units";


export const VoltageInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("V", "Volt"), min: 0 },
    initial, initialU,
);

export const AmperageInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("A", "Ampere"), min: 0 },
    initial, initialU,
);

export const ResistanceInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("\u03A9", "Ohm"), min: 0 },
    initial, initialU,
);
export const CapacitanceInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("F", "Farad"), min: 0 },
    initial, initialU,
);
export const InductanceInfo = (key: string, display: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { display, unit: Unit("H", "Henry"), min: 0 },
    initial, initialU,
);
