import type {DigitalCircuitDesigner} from "digital/api/circuitdesigner/DigitalCircuitDesigner";
import {useCurDesigner} from "shared/site/utils/hooks/useDesigner"


export const useCurDigitalDesigner = () =>
    useCurDesigner() as DigitalCircuitDesigner; // Maybe make this safer?
