import {AnyObj} from "core/models/types";

import {AnyComponentFrom, AnyPortFrom, AnyWireFrom} from "core/models/types/utils";


export class ObjSet<Objs extends AnyObj = AnyObj> {
    public readonly components: ReadonlyArray<AnyComponentFrom<Objs>>;
    public readonly wires:      ReadonlyArray<AnyWireFrom<Objs>>;
    public readonly ports:      ReadonlyArray<AnyPortFrom<Objs>>;

    public constructor(objs: Objs[]) {
        this.components =
            [...new Set(objs.filter((o) => (o.baseKind === "Component")))] as Array<AnyComponentFrom<Objs>>;
        this.wires =
            [...new Set(objs.filter((o) => (o.baseKind === "Wire")))]      as Array<AnyWireFrom<Objs>>;
        this.ports =
            [...new Set(objs.filter((o) => (o.baseKind === "Port")))]      as Array<AnyPortFrom<Objs>>;
    }
}
