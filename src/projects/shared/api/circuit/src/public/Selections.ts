import {Observable} from "../utils/Observable";

import {ObjContainer, ReadonlyObjContainer} from "./ObjContainer";


export type SelectionsEvent = {
    type: "numSelectionsChanged";
    newAmt: number;
}

export type ReadonlySelections = ReadonlyObjContainer;
export type Selections = Omit<ObjContainer, "select"> & Observable<SelectionsEvent> & {
    clear(): void;
}
