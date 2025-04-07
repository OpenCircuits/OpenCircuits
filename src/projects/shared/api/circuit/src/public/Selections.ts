import {Observable} from "../utils/Observable";

import {ObjContainer} from "./ObjContainer";


export type SelectionsEvent = {
    type: "numSelectionsChanged";
    newAmt: number;
}

export interface Selections extends Omit<ObjContainer, "withWiresAndPorts">, Observable<SelectionsEvent> {
    clear(): void;
}
