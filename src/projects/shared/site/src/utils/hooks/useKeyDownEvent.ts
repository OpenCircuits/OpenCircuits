import {useEffect} from "react";

import {InputAdapter}      from "shared/api/circuitdesigner/input/InputAdapter";
import type {InputAdapterEvent} from "shared/api/circuitdesigner/input/InputAdapterEvent";
import {Key}               from "shared/api/circuitdesigner/input/Key";


export const useKeyDownEvent = (input: InputAdapter, key: Key, f: () => void, deps?: React.DependencyList) => {
    useEffect(() => {
        if (!input)
            return;

        const LookForKey = (ev: InputAdapterEvent) => {
            if (ev.type === "keydown" && ev.key === key)
                f();
        }

        input.subscribe(LookForKey);

        return () => input.unsubscribe(LookForKey);
    }, [input, key, ...(deps ?? [])]);
}

export const useWindowKeyDownEvent = (key: Key, f: () => void, deps?: React.DependencyList) => {
    useEffect(() => {
        const LookForKey = (ev: KeyboardEvent) => {
            if (!(document.activeElement instanceof HTMLInputElement) && ev.key === key)
                f();
        }

        window.addEventListener("keydown", LookForKey);

        return () => window.removeEventListener("keydown", LookForKey);
    }, [key, ...(deps ?? [])]);
}
