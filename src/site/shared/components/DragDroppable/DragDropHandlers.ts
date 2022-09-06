import {Vector} from "Vector";


type DropHandler = (pos: Vector, ...data: unknown[]) => void;
type DropListener = (pos: Vector, hit: boolean, ...data: unknown[]) => void;

export const DragDropHandlers = (() => {
    const handlers = new Map<HTMLElement, DropHandler>();
    const listeners = new Set<DropListener>();

    return {
        add: (el: HTMLElement, onDrop: DropHandler) => {
            handlers.set(el, onDrop);
        },
        remove: (el: HTMLElement) => {
            handlers.delete(el);
        },
        drop: (pos: Vector, ...data: unknown[]) => {
            const el = document.elementFromPoint(pos.x, pos.y) as HTMLElement;
            const hit = handlers.has(el);
            if (hit)
                handlers.get(el)!(pos, ...data);
            listeners.forEach((l) => l(pos, hit, ...data));
        },
        addListener: (listener: DropListener) => {
            listeners.add(listener);
        },
        removeListener: (listener: DropListener) => {
            listeners.delete(listener);
        },
    };
})();
