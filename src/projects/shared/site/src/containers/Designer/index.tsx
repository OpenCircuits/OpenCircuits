import {CircuitDesignerController}         from "shared/api/circuit/controllers/CircuitDesignerController";
import React, {useLayoutEffect, useRef, useState} from "react";

import {Cursor} from "shared/api/circuit/utils/Cursor";

import {useSharedSelector} from "shared/src/utils/hooks/useShared";

import "./index.scss";


type Props = {
    circuit: CircuitDesignerController;
    className?: string;
    style?: React.CSSProperties;
    w: number;
    h: number;
}
export const Designer = React.forwardRef((
    { circuit, className, style, w, h }: Props, 
    forwardedRef: React.RefObject<HTMLCanvasElement>
) => {
    const defaultRef = useRef<HTMLCanvasElement>(null);
    const canvas = (forwardedRef ?? defaultRef);

    // Initial function called after the canvas first shows up to setup w/ `circuit`
    useLayoutEffect(() => circuit.setupOn(canvas.current!), [circuit, canvas]);

    // Update camera size when w/h changes
    //  (using layout effect so there's no pause/glitch when resizing the screen)
    useLayoutEffect(() => circuit.resize(w, h), [circuit, w, h]);

    // Setup listener to keep cursor in-sync with designer cursor
    const [ cursor, setCursor ] = useState(undefined as Cursor | undefined);
    useLayoutEffect(() =>
        circuit.subscribe((ev) => {
            if (ev.type === "circuitState" && ev.prop === "cursor")
                setCursor(ev.val);
        }),
    [circuit, setCursor]);

    // Keep redux lock state in-sync with designer locked state
    const { isLocked } = useSharedSelector((state) => ({ isLocked: state.circuit.isLocked }));
    useLayoutEffect(() => circuit.SetLocked(isLocked), [circuit, isLocked]);

    return (
        <canvas
            className={className}
            style={{...(style ?? {}), cursor}}
            ref={canvas}
            width={w} height={h} />
    );
});
Designer.displayName = "Designer";
