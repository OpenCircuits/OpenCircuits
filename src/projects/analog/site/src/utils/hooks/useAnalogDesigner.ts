import {AnalogCircuitDesigner} from "analog/api/circuitdesigner/AnalogCircuitDesigner";
import {useCurDesigner} from "shared/site/utils/hooks/useDesigner"


export const useCurAnalogDesigner = () =>
    useCurDesigner() as AnalogCircuitDesigner; // Maybe make this safer?
