import {Circuit} from "core/public";

import {DigitalComponentInfo} from "./DigitalComponentInfo";


export interface DigitalCircuit extends Circuit {
    propagationTime: number;

    getComponentInfo(kind: string): DigitalComponentInfo | undefined;
}
