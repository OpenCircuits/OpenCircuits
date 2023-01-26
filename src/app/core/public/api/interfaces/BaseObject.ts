import {Rect} from "core/public/utils/math/Rect";
import {Prop} from "../../../schema/Prop";


export interface IBaseObject {
    readonly kind: string;
    readonly id: string;
    readonly bounds: Rect;

    isSelected: boolean;
    zIndex: number;

    setProp(key: string, val: Prop): void;
    getProp(key: string): Prop;
    getProps(): Record<string, Prop>;
}
