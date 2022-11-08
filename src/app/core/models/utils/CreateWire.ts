import {v4 as uuid} from "uuid";

import {GUID} from "core/utils/GUID";

import {AnyWire, DefaultWire} from "core/models/types";


export function CreateWire(kind: AnyWire["kind"], p1: GUID, p2: GUID, id = uuid()) {
    return DefaultWire[kind](id, p1, p2);
}
