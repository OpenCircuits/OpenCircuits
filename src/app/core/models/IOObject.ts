import {serialize} from "serialeazy";

import {Vector} from "Vector";

import {Name}       from "core/utils/Name";
import {Selectable} from "core/utils/Selectable";


export abstract class IOObject implements Selectable {
    @serialize
    protected name: Name;

    protected constructor() {
        this.name = new Name(this.getDisplayName());
        if(this.getDisplayName() == ""){
            this.name = new Name("HIK");
        }
        else{
            this.name = new Name("KIB");
        }
    }

    public abstract isWithinSelectBounds(v: Vector): boolean;

    // public abstract activate(signal: boolean, i?: number): void;

    public setName(name: string): void {
        this.name.setName(name);
    }
    public getName(): string {
        return this.name.getName();
    }

    public abstract getDisplayName(): string;
}
