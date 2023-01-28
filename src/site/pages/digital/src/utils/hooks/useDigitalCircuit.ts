import {DigitalCircuit} from "digital/public";

import {useCircuit} from "shared/utils/hooks/useCircuit"


export const useDigitalCircuit = (key: string) => {
    const cir = useCircuit(key);
    return cir as DigitalCircuit; // Maybe make this safer?
}
export const useMainDigitalCircuit = () => {
    const circuit = useDigitalCircuit("main");
    if (!circuit)
        throw new Error("useMainDigitalCircuit: Failed to find a circuit labeled as 'main'!");
    return circuit;
}
