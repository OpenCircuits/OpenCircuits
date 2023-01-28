import {Circuit} from "core/public";


const { storeCircuit, useCircuit, useMainCircuit } = (() => {
    const storedCircuits = new Map<string, Circuit>();

    return {
        storeCircuit: (key: string, circ: Circuit) => {
            storedCircuits.set(key, circ);
        },
        useCircuit:     (key: string) => storedCircuits.get(key),
        useMainCircuit: () => {
            const circuit = storedCircuits.get("main");
            if (!circuit)
                throw new Error("useMainCircuit: Failed to find a circuit labeled as 'main'!");
            return circuit;
        },
    };
})();

export {storeCircuit, useCircuit, useMainCircuit};
