import {Vector} from "Vector";


export interface Selectable {
    setName(name: string): void;
    getName(): string;

    isWithinSelectBounds(v: Vector): boolean;
}
