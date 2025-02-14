import {Rect} from "math/Rect";

import {Prop} from "../schema/Prop";


export interface BaseObject {
    readonly kind: string;
    readonly id: string;
    readonly bounds: Rect;

    name: string | undefined;

    isSelected: boolean;
    zIndex: number;

    select(): void;
    deselect(): void;

    exists(): boolean;

    setProp(key: string, val: Prop): void;
    getProp(key: string): Prop | undefined;
    getProps(): Readonly<Record<string, Prop>>;
}
