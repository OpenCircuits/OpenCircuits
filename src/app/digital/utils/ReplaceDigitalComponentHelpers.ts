import {Create, GetIDFor} from "serialeazy";

import {CoderPortChangeAction} from "digital/actions/ports/CoderPortChangeAction";
import {InputPortChangeAction} from "digital/actions/ports/InputPortChangeAction";
import {MuxPortChangeAction}   from "digital/actions/ports/MuxPortChangeAction";

import {DigitalCircuitDesigner, DigitalComponent, InputPort, OutputPort} from "digital/models";

import {Decoder, Encoder, IC} from "digital/models/ioobjects";

import {Mux} from "digital/models/ioobjects/other/Mux";


type ReplacementList = Map<
//    #inputs : #outputs
    `${number}:${number}`,
    Array<{
        id: string;
        amt?: number;
    }>
>;

export type DigitalID = `ic/${string}` | string;

function GetReplacementListKey(comp: DigitalComponent) {
    const inputPorts  = comp.getPorts().filter(p => (p instanceof  InputPort));
    const outputPorts = comp.getPorts().filter(p => (p instanceof OutputPort));
    return `${inputPorts.length}:${outputPorts.length}` as const;
}

export function CreateDigitalComponent(id: DigitalID, designer: DigitalCircuitDesigner) {
    if (id.startsWith("ic")) {
        const idx = parseInt(id.split("/")[1]);
        return new IC(designer.getICData()[idx]);
    }
    return Create<DigitalComponent>(id);
}

export function GetDigitalIDFor(comp: DigitalComponent, designer: DigitalCircuitDesigner) {
    if (comp instanceof IC) {
        const idx = designer.getICData().indexOf(comp.getData());
        return `ic/${idx}`;
    }
    return GetIDFor(comp);
}

export function GetPortChangeAction(comp: DigitalComponent, amt: number) {
    if (comp instanceof Mux)
        return new MuxPortChangeAction(comp, amt, amt);
    if (comp instanceof Encoder || comp instanceof Decoder)
        return new CoderPortChangeAction(comp, amt, amt);
    return new InputPortChangeAction(comp, amt, amt);
}

export function GenerateReplacementList(designer: DigitalCircuitDesigner, allComponents: string[]) {
    const list: ReplacementList = new Map();

    allComponents.forEach(id => {
        const comp = CreateDigitalComponent(id, designer);
        if (!comp)
            throw new Error(`Can't find component w/ ID: ${id}`);

        const count = (() => {
            if (comp instanceof Mux)
                return comp.getSelectPortCount();
            if (comp instanceof Encoder)
                return comp.getOutputPortCount();
            return comp.getInputPortCount();
        })();

        const min = count.getMinValue();
        const max = count.getMaxValue();

        for (let amt = min; amt <= max; amt++) {
            // Only change if it's a component that can change the number of inputs/outputs
            if (max !== min) {
                // Change ports and see how many input/outputs there are
                GetPortChangeAction(comp, amt).execute();
            }

            const key = GetReplacementListKey(comp);
            if (!list.has(key))
                list.set(key, []);
            list.get(key)?.push({
                id,
                amt: (max === min ? undefined : amt),
            });
        }
    });

    return list;
}


export function GetReplacements(comp: DigitalComponent, designer: DigitalCircuitDesigner, list: ReplacementList) {
    const key = GetReplacementListKey(comp);
    if (!list.has(key))
        throw new Error(`Failed to find ReplaceList entry with key ${key} for component ${comp.getName()}`);

    const id = GetDigitalIDFor(comp, designer);

    // Put the `comp`s entry at the beginning of the array
    const self = list.get(key)!.find(r => r.id === id)!;
    return [self, ...list.get(key)!.filter(r => r.id !== id)];
}
