import {Observable} from "../utils/Observable";

import {ObjContainer, ReadonlyObjContainer} from "./ObjContainer";


export type SelectionsEvent = {
    type: "numSelectionsChanged";
    newAmt: number;
}

export type ReadonlySelections = ReadonlyObjContainer;
export type Selections = ObjContainer & Observable<SelectionsEvent> & {
    clear(): void;
}
