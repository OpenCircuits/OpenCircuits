import {Obj, Prop} from "shared/api/circuit/public";

import {PropInfo, PropInfoEntryField, PropInfoGetter} from "./PropInfo";


export const DefaultEntryFieldDefaults = {
    "int":      0,
    "float":    0,
    "string":   "",
    "string[]": "",
    "number[]": 0,
    "color":    "#000000",
} as const;

// This functions similarly to a simple o.getProps(), a record of property key-values.
// However, it accounts for the fact that some props aren't always set
// (i.e. initially every component has x/y undefined but defaults to 0).
// It uses the PropInfoRecord to find all the props that the object has
// and then gets the props from the object, or uses a default value.
export function GetPropsWithInfoFor(o: Obj, propInfo: PropInfoGetter): Record<string, Prop> {
    // Recursively get all the info fields from the info
    // A field is an entry that isn't a group
    function getPropFields(info: PropInfo): PropInfoEntryField[] {
        return info.flatMap((entry) => {
            if (entry.type === "group")
                return getPropFields(entry.info);
            return entry;
        });
    }

    function getProps(field: PropInfoEntryField): Array<readonly [string, Prop]> {
        const mainProp = [
            field.key,
            (o.getProp(field.key)
                ?? field.default
                ?? DefaultEntryFieldDefaults[field.type]),
        ] as const;

        // Get the unit prop as well if there is one.
        if ((field.type === "int" || field.type === "float") && field.unit) {
            return [
                mainProp,
                [
                    field.unit.key,
                    (o.getProp(field.unit.key) ?? field.unit.default),
                ],
            ]
        }
        return [mainProp];
    }

    const info = propInfo(o);
    if (!info) {
        console.warn(`Failed to find prop info for ${o.kind}!`);
        return {};
    }
    return Object.fromEntries(getPropFields(info).flatMap(getProps));
}
