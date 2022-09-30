import {v4 as uuid} from "uuid";

import {GUID} from "core/utils/GUID";

import {AllInfo} from "core/models/info";
import {AnyWire} from "core/models/types";


export function CreateWire(kind: AnyWire["kind"], p1: GUID, p2: GUID, id = uuid()) {
    return AllInfo[kind].Default(id, p1, p2);
}
