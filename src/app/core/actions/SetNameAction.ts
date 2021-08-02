import {Selectable} from "core/utils/Selectable";
import {Action} from "core/actions/Action";
import {CustomBehavior, serializable, serialize, Serialize} from "serialeazy";
import {Serializer} from "serialeazy/dist/Serialization";
import {Distinguishable} from "core/utils/Distinguishable";

export function ref(): (target: any, propertyKey: string) => void {
    return function (target, propertyKey) {
        Reflect.defineMetadata(propertyKey, true, target);
    };
}

// TODO: This is a hack, an annotation (@ref) would be much better
export function serializeRefs<T>(refNames: string[]): CustomBehavior<T> {
    return {customSerialization: (serializer: Serializer, obj: any) => {
        const data = serializer.defaultSerialization(obj);
        for (const o of refNames) {
            data[o] = (obj[o] as Distinguishable).getGuid();
        }
        return data;
    }};
}

@serializable("SetNameAction", serializeRefs(["obj"]))
export class SetNameAction implements Action {
    @serialize(false)
    private obj?: Selectable & Distinguishable;
    private newName: string;
    private oldName: string;

    public constructor(o?: Selectable & Distinguishable, newName?: string) {
        this.setObj(o);
        this.setName(newName);
    }

    public setObj(o?: Selectable & Distinguishable) {
        this.obj = o;
        this.oldName = o.getName();
    }

    public setName(newName: string) {
        this.newName = newName;
    }

    public execute(): Action {
        console.log(Serialize(this));
        this.obj.setName(this.newName);
        return this;
    }

    public undo(): Action {
        this.obj.setName(this.oldName);
        return this;
    }

}
