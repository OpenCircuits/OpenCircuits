import React, {useEffect} from "react";


export const useDocEvent = <K extends keyof DocumentEventMap>(
    event: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => void,
    deps?: React.DependencyList,
    options?: boolean | AddEventListenerOptions,
) => {
    useEffect(() => {
        document.addEventListener(event, listener, options);
        return () => document.removeEventListener(event, listener, options);
    }, deps);
}
