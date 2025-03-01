import type {DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {useDesigner, useMainDesigner} from "shared/site/utils/hooks/useDesigner"


export const useDigitalDesigner = (key: string) =>
    useDesigner(key) as DigitalCircuitDesigner; // Maybe make this safer?

export const useMainDigitalDesigner = () => useMainDesigner() as DigitalCircuitDesigner;
