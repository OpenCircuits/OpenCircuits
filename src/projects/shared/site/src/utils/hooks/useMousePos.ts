import {useEffect, useState} from "react";
import {useDocEvent}         from "./useDocEvent";
import {CalculateMidpoint} from "math/MathUtils";
import {V, Vector} from "Vector";


export const useMousePos = () => {
    const [pos, setPos] = useState({
        x: 0,
        y: 0,
    });

    useEffect(() => {
        const getTouchPositions = (touches: TouchList): Vector[] => [...touches].map((t) => V(t.pageX, t.pageY));

        const mouseListener = (ev: MouseEvent) => {
            setPos({ x: ev.pageX, y: ev.pageY });
        }
        const touchListener = (ev: TouchEvent) => {
            setPos(CalculateMidpoint(getTouchPositions(ev.touches)));
        }

        // For some reason, webkit has issues with pointermove so we need to use separate mousemove and touchmove, see #1443
        window.addEventListener("mousemove", mouseListener);
        window.addEventListener("touchmove", touchListener);
        return () => {
            window.removeEventListener("mousemove", mouseListener);
            window.removeEventListener("touchmove", touchListener);
        }
    }, [setPos]);

    return pos;
}

export const useMouseDownPos = () => {
    const [pos, setPos] = useState({
        x: 0,
        y: 0,
    });

    useDocEvent("mousedown", (ev) => {
        setPos({ x: ev.pageX, y: ev.pageY });
    }, [setPos]);

    return pos;
}

export const useDeltaMousePos = () => {
    const [{ x, y, px, py, isMouseDown }, setState] = useState({
        x: 0,
        y: 0,

        px: 0,
        py: 0,

        isMouseDown: false,
    });

    useEffect(() => {
        const mouseListener = (ev: PointerEvent) => {
            setState((prevState) => ({
                x: ev.pageX,
                y: ev.pageY,

                px: prevState.x,
                py: prevState.y,

                isMouseDown: prevState.isMouseDown,
            }));
        }
        const mouseUpListener   = () => setState((prevState) => ({ ...prevState, isMouseDown: false }));
        const mouseDownListener = () => setState((prevState) => ({ ...prevState, isMouseDown: true }));

        window.addEventListener("pointerup", mouseUpListener);
        window.addEventListener("pointerdown", mouseDownListener);
        window.addEventListener("pointermove", mouseListener);
        return () => {
            window.removeEventListener("pointerup", mouseUpListener);
            window.removeEventListener("pointerdown", mouseDownListener);
            window.removeEventListener("pointermove", mouseListener);
        }
    }, [setState]);

    return {
        dx: x - px,
        dy: y - py,
        isMouseDown,
    };
}
