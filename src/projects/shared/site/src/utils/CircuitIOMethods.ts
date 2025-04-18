import {Circuit} from "shared/api/circuit/public";
import {Schema} from "shared/api/circuit/schema";


const { SerializeCircuit, DeserializeCircuit, setSerializeCircuitFunc, setDeserializeCircuitFunc } = (() => {
    let curSerializeFunc: ((circuit: Circuit) => Blob) | undefined;
    let curDeserializeFunc: ((data: string | ArrayBuffer) => Schema.Circuit) | undefined;
    return {
        setSerializeCircuitFunc:   (func: ((circuit: Circuit) => Blob)) => curSerializeFunc = func,
        setDeserializeCircuitFunc: (func: ((data: string | ArrayBuffer) => Schema.Circuit)) => curDeserializeFunc = func,
        SerializeCircuit: (circuit: Circuit) => {
            if (!curSerializeFunc)
                throw new Error("CircuitIOMethods.SerializeCircuit: Must set serialize function before calling!");
            return curSerializeFunc(circuit);
        },
        DeserializeCircuit: (data: string | ArrayBuffer) => {
            if (!curDeserializeFunc)
                throw new Error("CircuitIOMethods.DeserializeCircuit: Must set serialize function before calling!");
            return curDeserializeFunc(data);
        },
    };
})();

export {SerializeCircuit, DeserializeCircuit, setSerializeCircuitFunc, setDeserializeCircuitFunc};
