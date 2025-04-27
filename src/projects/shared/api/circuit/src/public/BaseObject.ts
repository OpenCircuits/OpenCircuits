import {Rect} from "math/Rect";

import {Prop} from "shared/api/circuit/schema";


export interface ReadonlyBaseObject {
    readonly kind: string;
    readonly id: string;
    readonly bounds: Rect;

    readonly name: string | undefined;

    readonly isSelected: boolean;
    readonly zIndex: number;

    exists(): boolean;

    getProp(key: string): Prop | undefined;
    getProps(): Readonly<Record<string, Prop>>;
}

export interface BaseObject extends ReadonlyBaseObject {
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
