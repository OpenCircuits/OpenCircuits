import {Rect} from "math/Rect";

import {Prop} from "shared/api/circuit/schema";


interface BaseReadonlyBaseObject {
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

export type ReadonlyBaseObject = BaseReadonlyBaseObject;

export type BaseObject = BaseReadonlyBaseObject & {
    name: string | undefined;

    isSelected: boolean;
    zIndex: number;

    select(): void;
    deselect(): void;

    setProp(key: string, val: Prop): void;
}
