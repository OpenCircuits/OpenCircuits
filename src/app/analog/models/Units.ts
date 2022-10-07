import {Unit, UnitKey, UnitNumberInfo} from "core/utils/Units";


export const VoltageInfo = (key: string, label: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { label, unit: Unit("V", "Volt"), min: 0 },
    initial, initialU,
);

export const AmperageInfo = (key: string, label: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { label, unit: Unit("A", "Ampere"), min: 0 },
    initial, initialU,
);

export const ResistanceInfo = (key: string, label: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { label, unit: Unit("\u03A9", "Ohm"), min: 0 },
    initial, initialU,
);
export const CapacitanceInfo = (key: string, label: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { label, unit: Unit("F", "Farad"), min: 0 },
    initial, initialU,
);
export const InductanceInfo = (key: string, label: string, initial = 0, initialU: UnitKey = " ") => UnitNumberInfo(
    key,
    { label, unit: Unit("H", "Henry"), min: 0 },
    initial, initialU,
);
