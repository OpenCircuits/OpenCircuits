import {useEffect} from "react";

import {InputManager, InputManagerEvent} from "core/utils/InputManager";
import {Key}                             from "core/utils/Key";


export const useKeyDownEvent = (input: InputManager, key: Key, f: () => void, deps?: React.DependencyList) => {
    useEffect(() => {
        if (!input)
            return;

        const LookForKey = (ev: InputManagerEvent) => {
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

