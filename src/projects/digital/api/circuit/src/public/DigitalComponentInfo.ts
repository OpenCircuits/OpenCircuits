import type {ComponentInfo} from "shared/api/circuit/public";
import type {APIToDigital}  from "./DigitalCircuit";


export interface DigitalComponentInfo extends APIToDigital<ComponentInfo> {
    readonly inputPortGroups: readonly string[];
    readonly outputPortGroups: readonly string[];
}
