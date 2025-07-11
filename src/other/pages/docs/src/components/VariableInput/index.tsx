import {useEffect, useState} from "react";

/* eslint-disable react/forbid-elements */
const VARIABLES = (() => {
    const vals: Record<string, string> = {};
    const listeners: Record<string, Array<(newVal: string) => void>> = {};

    return {
        set: (id: string, val: string) => {
            vals[id] = val;
            (listeners[id] ?? []).forEach((fn) => fn(val));
        },
        get: (id: string): string | undefined => vals[id],

        subscribe: (id: string, f: (newVal: string) => void) => {
            if (!(id in listeners))
                listeners[id] = [];
            listeners[id].push(f);
            return () => {
                listeners[id].splice(listeners[id].indexOf(f), 1);
            };
        },
    };
})();

export const useVariable = (id: string) => {
    const [val, setVal] = useState(VARIABLES.get(id));

    useEffect(() => {
        setVal(VARIABLES.get(id));
        return VARIABLES.subscribe(id, (newVal) => setVal(newVal));
    }, [id, setVal]);

    return val;
}


export interface InputFieldProps {
    id: string;
    defaultValue?: string;
}
export const InputField = ({ id, defaultValue }: InputFieldProps) => {
    const [val, setVal] = useState(defaultValue);

    useEffect(() => {
        VARIABLES.set(id, val);
    }, [id, val]);

    return (
        <input type="text"
               value={val}
               onChange={(ev) => setVal(ev.target.value)} />
    );
}

function toProperCase(s: string): string {
    if (s.length === 0)
        return s;
    return s.split(" ").map((v) => v[0].toUpperCase() + v.slice(1)).join(" ");
}

export interface VariableProps {
    id: string;
    proper?: boolean;
    upper?: boolean;
    lower?: boolean;
    combined?: boolean;
}
export const Variable = ({ id, proper, upper, lower, combined }: VariableProps) => {
    const val = useVariable(id);

    if (!val)
        return <code>{}</code>;

    const val2 = proper ? toProperCase(val) : val;
    const val3 = upper ? val2.toUpperCase() : val2;
    const val4 = lower ? val3.toLowerCase() : val3;
    const val5 = combined ? val4.split(" ").join("") : val4;

    return <code>{val5}</code>;
}
