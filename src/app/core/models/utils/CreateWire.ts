import {v4 as uuid} from "uuid";

import {GUID} from "core/utils/GUID";

import {AnyWire} from "core/models/types";

import {AllInfo} from "core/views/info";


export function CreateWire(kind: AnyWire["kind"], p1: GUID, p2: GUID, id = uuid()) {
    return AllInfo[kind].Default(id, p1, p2);
}
