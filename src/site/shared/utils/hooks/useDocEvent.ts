import React, {useEffect} from "react";


export const useDocEvent = <K extends keyof DocumentEventMap>(
    event: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    deps?: React.DependencyList
) => {
    useEffect(() => {
        document.addEventListener(event, listener);
        return () => document.removeEventListener(event, listener);
    }, deps);
}
