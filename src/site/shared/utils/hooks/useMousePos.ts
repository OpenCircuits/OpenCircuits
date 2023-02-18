import {useEffect, useState} from "react";
import {useDocEvent} from "./useDocEvent";


export const useMousePos = () => {
    const [pos, setPos] = useState({
        x: 0 as number,
        y: 0 as number,
    });

    useEffect(() => {
        // const getTouchPositions = (touches: TouchList): Vector[] => {
        //     return Array.from(touches).map((t) => V(t.pageX, t.pageY));
        // };

        const mouseListener = (ev: PointerEvent) => {
            setPos({ x: ev.pageX, y: ev.pageY });
        }
        // const touchListener = (ev: TouchEvent) => {
        //     setPos(CalculateMidpoint(getTouchPositions(ev.touches)));
        // }

        window.addEventListener("pointermove", mouseListener);
        return () => {
            window.removeEventListener("pointermove", mouseListener);
        }
    }, [setPos]);

    return pos;
}

export const useMouseDownPos = () => {
    const [pos, setPos] = useState({
        x: 0 as number,
        y: 0 as number,
    });

    useDocEvent("mousedown", (ev) => {
        setPos({ x: ev.pageX, y: ev.pageY });
    }, [setPos]);

    return pos;
}

export const useDeltaMousePos = () => {
    const [{ x, y, px, py }, setState] = useState({
        x: 0,
        y: 0,

        px: 0,
        py: 0,
    });

    useEffect(() => {
        const mouseListener = (ev: PointerEvent) => {
            setState((prevState) => ({
                x: ev.pageX,
                y: ev.pageY,

                px: prevState.x,
                py: prevState.y
            }));
        }

        window.addEventListener("pointermove", mouseListener);
        return () => window.removeEventListener("pointermove", mouseListener);
    }, [setState]);

    return {
        dx: x - px,
        dy: y - py
    };
}
