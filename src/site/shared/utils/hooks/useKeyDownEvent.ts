import {useEffect} from "react";

import {InputManager}      from "shared/utils/input/InputManager";
import {Key}               from "shared/utils/input/Key";
import {InputManagerEvent} from "../input/InputManagerEvent";


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
